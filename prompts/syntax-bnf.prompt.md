## 基于 BNF 的语法规则模型设计
设计一个基于 BNF (巴科斯-诺尔范式) 的语法规则模型，支持 Token、推导和联合规则。模型应能描述各种编程语言的语法结构，并提供灵活的元数据扩展。
这个 BNF 模型可用于后续对程序代码的分析、转换和生成。

### 文件结构
- 文档
  - `prompts/syntax-bnf.prompt.md`: BNF 模型的设计文档（提示词），描述模型的结构、规则和验证方法。
- BNF 核心逻辑
  - `src/core/bnf-model/`: 实现 BNF 模型的核心逻辑。
  - `src/core/bnf-model/types.ts`: 定义 BNF 模型的 TypeScript 类型。
  - `src/core/bnf-model/bnf-parser.ts`: BNF 模型的解析器，从 JSON/YAML 输入解析和验证模型。
  - `src/core/bnf-model/generator.ts`: BNF 模型的代码生成器，生成 TypeScript 语法树节点。
- TypeScript 语言支持
  - `src/core/languages/typescript/`: TypeScript 语言的 BNF 模型实现
  - `src/core/languages/typescript/syntax.bnf.ts`: 手写，TypeScript 的语法规则模型，符合 BNF JSON 规范。
  - `src/core/languages/typescript/schema/`: 脚本生成，BNF generator 根据 `syntax.bnf.ts` 生成的 JSON schema 和 TypeScript 类型定义，内部结构参考语法树生成部分。
  - `src/core/languages/typescript/stringify.ts`: 脚本生成，TypeScript 语法树节点的字符串化函数，支持 schema 中定义的所有节点类型。
  - `src/core/languages/typescript/fromTsNode/`: 脚本生成，从 TypeScript 的 `ts.Node` 转换为 BNF 模型的语法树节点，
- 工具脚本，全部使用 `commander` 实现，并注册为 `package.json` 的脚本命令。
  - `scripts/bnf-model.ts`: BNF 模型的命令行工具，提供验证和代码生成功能
    - validate: 验证 BNF 模型的正确性
    - generate schema: 生成 BNF 模型的 TypeScript 类型定义
    - generate stringify: 生成 BNF 模型的字符串化函数
  - `scripts/generate-from-ts-node.ts`: 代码生成脚本，基于 TypeScript 的 BNF 模型（含 metadata）生成一系列 fromTsNode 函数。从 `ts.Node` 生成 BNF 模型的语法树节点。注意，这个实现需要循环递归，需要定义一个通用节点的转化函数，表现为一个查表函数（可以用 `switch` 实现），并将其自身作为参数传递给每个具体的节点转换函数，以满足递归调用的需求。


### BNF 模型 JSON 结构定义 (TypeScript 类型)

```typescript
type BaseNode<M> = {
  description: string; // 规则描述
  metadata?: M; // 可选附加元数据
}

type TokenNode<M> = BaseNode<M> & {
  type: 'token'; // Token 规则
  pattern: TokenPattern; // Token 匹配模式
}

type TokenPattern = string | { regex: string }

type DeductionNode<M> = BaseNode<M> & {
  type: 'deduction'; // 推导规则
  sequence: DeductionElement[];
  precedence?: number;
  associativity?: 'left' | 'right' | 'non-associative'; // 运算符结合性
}

type DeductionElement
  = string // 直接引用的 Node 名称，这种方式引用的 Node 必须是 pattern 为 string 的 TokenNode
  | {
      node: string; // 引用的 Node 名称
      prop: string; // 引用的 Node 作为父节点的属性名称
    }

type UnionNode<M> = BaseNode<M> & {
  type: 'union'; // 联合规则
  members: string[]; // 成员 Node 名称列表
}

type BFNNode<M> = TokenNode<M> | DeductionNode<M> | UnionNode<M>;

type BFNModel<M> = {
  name: string; // 模型名称
  version: string; // 版本号
  start: string; // 起始 Node 名称
  nodes: Record<string, BFNNode<M>>; // Node 定义集，键为规则对应的 Node 名称
}
```

### BNF 模型检查
输入为 BNF 模型 JSON，输出成功，或错误列表
- 检查每个 Node 的 `type` 是否正确
- 检查每个 TokenNode 的 `pattern` 是否符合要求
  - 如果是字符串，则必须是非空，无空白字符的字符串
  - 如果是正则表达式，则必须是有效的正则表达式
- 检查每个 DeductionNode 的 `sequence` 是否符合要求
  - 必须是一个非空数组
  - 数组中的每个元素必须是有效的 `DeductionElement`
    - 如果是字符串，则必须是 `pattern` 为 `string` 的 `TokenNode` 名称
    - 如果是对象，则必须包含 `node` 和 `prop` 属性，且 `node` 必须是已定义的 Node 名称，`prop` 必须是符合 camelCase 的字符串
- 检查每个 UnionNode 的 `members` 是否符合要求
  - 必须是一个非空数组
  - 数组中的每个元素必须是已定义的 Node 名称

### 语法树生成
输入为 BNF 模型，输出为语法树结构，的 TypeScript 定义，包含：
- 为每个 Token 定义一个 TypeScript 类型
  - 如果 Token 的 `pattern` 是正则表达式，则需要有一个 `text` 属性用来存储匹配的文本
  - 如果 Token 的 `pattern` 是字符串，则把 Token 的 `pattern` 字符串加入到一个 Token 注册表中
- 为每个 DedutionNode 定义一个 object 类型
  - 每个有 `prop` 属性的 DeductionElement，对应 object 类型的一个属性，属性名为 `prop` 的值，类型为引用的 Node 的类型
  - 如果有 `precedence` 属性，则把 `precedence` 值加入到一个常量注册表中
  - 如果有 `associativity` 属性，则把 `associativity` 值加入到一个常量注册表中
- 为每个 UnionNode 定义一个联合类型，包含所有成员 Node 的类型
- 把每个 Node 的元数据加入到一个元数据注册表中
- 输出应该为一系列，表达为 `Record<string /* relative path */, string /* TypeScript code */>` 的对象
  - 所有的 Token 类型定义在一个文件中，`token-types.ts`
  - 所有的 DeductionNode，UnionNode 放在 `node` 文件夹下，避免名字冲突
    - 每个 DeductionNode 的类型生成一个单独的文件，如 `node/some-deduction-node.ts`，`import type` 引入依赖的类型
    - 每个 UnionNode 的类型生成一个单独的文件，如 `node/some-union-node.ts`，`import type` 引入依赖的类型
    - `node/index.ts` 导出所有 DeductionNode 和 UnionNode 的类型
  - 全局注册表分别放在 4 个文件里
    - `token-constants.ts`: 包含所有 Token 的字符串常量
    - `precedence-constants.ts`: 包含所有运算符的优先级
    - `associativity-constants.ts`: 包含所有运算符的结合性
    - `metadata-constants.ts`: 包含所有 Node 的元数据
    - `index.ts`: 导出所有类型和常量，方便统一导入


### 代码生成脚本
输入任何一个 BNF 模型生成的语法树节点，要可以递归输出对应的代码
- 对于 `TokenNode`，输出对应的 `text` 或从常量注册表中获取的字符串。
- 对于 `DeductionNode`，按顺序输出每个 `DeductionElement` 对应的转换后的代码。

### TypeScript 语法树的元数据
为了方便从 `ts.Node` 生成语法树，我们需要给每个 Node 定义一个元数据 `{ syntaxKind: number, syntaxKindName: string }`，其中 `syntaxKind` 是 TypeScript 的 `SyntaxKind` 枚举值，`syntaxKindName` 是对应的名称。

`TokenNode` 和 `DeductionNode` 需要跟 `SyntaxKind` 枚举值对应，`UnionNode` 无需对应，但间接的关联到了一组 `SyntaxKind`。




