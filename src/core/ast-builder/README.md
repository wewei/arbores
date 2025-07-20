# AST Builder 架构设计

## 核心设计原则

### 1. 通用创建函数
```typescript
type CreateNodeFn<T extends ts.Node = ts.Node> = (sourceFile: SourceFileAST, node: ASTNode) => T
```

这是一个通用的节点创建函数，它：
- 接受 `SourceFileAST` 和 `ASTNode` 作为参数
- 根据 `node.kind` 使用大 switch 语句调用具体的节点构建函数
- 返回相应的 TypeScript 节点

### 2. 具体节点构建函数
```typescript
type NodeBuilderFn<T extends ts.Node> = (createNode: CreateNodeFn<ts.Node>) => CreateNodeFn<T>
```

每个具体的节点构建函数：
- 接受通用的 `createNode` 函数作为参数
- 返回一个针对特定节点类型的创建函数
- 可以递归调用 `createNode` 来构建子节点
- 使用 `ts.factory` 函数来构建最终的 TypeScript 节点

### 3. 文件结构
```
src/ast-builder/
├── README.md              # 架构文档
├── index.ts               # 主入口，导出通用 createNode 函数
├── types.ts               # 类型定义
├── nodes/                 # 具体节点构建函数
│   ├── source-file.ts     # SourceFile 节点
│   ├── function-declaration.ts  # FunctionDeclaration 节点
│   ├── variable-statement.ts    # VariableStatement 节点
│   ├── block.ts           # Block 节点
│   ├── call-expression.ts # CallExpression 节点
│   └── ...                # 其他节点类型
└── utils/                 # 工具函数
    ├── find-child.ts      # 查找子节点的工具函数
    └── modifiers.ts       # 修饰符处理工具函数
```

## 实现步骤

### 阶段1：基础架构
1. 创建类型定义 (`types.ts`)
2. 创建主入口函数 (`index.ts`)
3. 创建工具函数 (`utils/`)

### 阶段2：核心节点实现
1. 实现 `SourceFile` 节点构建
2. 实现 `FunctionDeclaration` 节点构建
3. 实现 `Block` 节点构建
4. 实现 `VariableStatement` 节点构建

### 阶段3：表达式节点实现
1. 实现 `CallExpression` 节点构建
2. 实现 `PropertyAccessExpression` 节点构建
3. 实现 `AwaitExpression` 节点构建
4. 实现 `BinaryExpression` 节点构建

### 阶段4：其他节点实现
1. 实现 `Parameter` 节点构建
2. 实现 `TypeReference` 节点构建
3. 实现各种 Token 节点构建
4. 实现 `SyntaxList` 节点构建

## 优势

1. **消除重复代码**：通用 `createNode` 函数避免了多处重复的 switch 语句
2. **类型安全**：使用 TypeScript 泛型确保类型安全
3. **模块化**：每个节点类型都有独立的构建函数
4. **可扩展性**：添加新节点类型只需要添加新的构建函数
5. **可测试性**：每个构建函数都可以独立测试
6. **递归支持**：通过传递 `createNode` 函数支持递归构建

## 使用示例

```typescript
import { createNode } from './ast-builder';

// 使用通用函数创建节点
const tsNode = createNode(sourceFileAST, astNode);

// 类型安全的使用
const functionNode = createNode<ts.FunctionDeclaration>(sourceFileAST, astNode);
```

## 迁移策略

从现有的 `stringifier` 系统迁移到新的 `ast-builder` 系统：

1. 保留现有的 `stringifier` 系统不变
2. 逐步实现新的 `ast-builder` 系统
3. 在新系统稳定后，更新 `stringifier` 使用新的 `ast-builder`
4. 最终移除旧的重复代码

这样可以确保在重构过程中系统始终保持可用状态。
