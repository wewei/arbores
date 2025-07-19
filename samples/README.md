# AST Builder 开发样本

这个文件夹包含用于开发和测试 ast-builder 系统的示例代码。

## 开发流程

使用以下迭代流程来完善 ast-builder 系统：

### 1. 创建示例代码
在 `samples/` 文件夹中创建包含新语法特性的 TypeScript 示例文件：
```bash
# 例如创建 samples/basic-expressions.ts
```

### 2. 生成 AST JSON
使用 CLI 工具解析示例代码生成 AST：
```bash
bun run cli/index.ts parse samples/basic-expressions.ts -a samples/basic-expressions.ast.json -O
# 这会生成 samples/basic-expressions.ast.json
```

### 3. 尝试代码生成
使用 stringify 命令测试代码生成，识别缺失的节点类型：
```bash
bun run cli/index.ts stringify samples/basic-expressions.ast.json
# 输出会显示 "Unsupported node type: XXX" 错误
```

### 4. 检查 AST 结构
使用 tree 命令查看特定节点的 AST 结构：
```bash
bun run cli/index.ts tree samples/basic-expressions.ast.json -n some-node-id
# 这帮助理解如何实现缺失的节点类型
```

### 5. 实现缺失的节点类型
在 `src/ast-builder/nodes/` 中实现新的节点构建器：
```typescript
// 例如 src/ast-builder/nodes/binary-expression.ts
export const createBinaryExpression: NodeBuilderFn<ts.BinaryExpression> = (
  sourceFile: SourceFileAST,
  node: ASTNode,
  createNode: CreateNodeFn<ts.Node>
): ts.BinaryExpression => {
  // 实现逻辑
};
```

### 6. 更新主索引
在 `src/ast-builder/index.ts` 的 switch 语句中添加新的 case：
```typescript
case ts.SyntaxKind.BinaryExpression:
  return createBinaryExpression(sourceFile, node, createNode);
```

### 7. 测试验证
重新运行 stringify 命令验证实现：
```bash
bun run cli/index.ts stringify samples/basic-expressions.ast.json
# 应该生成正确的 TypeScript 代码
```

## 示例文件组织

按功能组织示例文件：

- `basic-syntax.ts` - 基础语法：变量、函数、类型
- `expressions.ts` - 表达式：二元运算、属性访问、调用表达式
- `async-await.ts` - 异步语法：async/await、Promise
- `classes.ts` - 类声明：构造函数、方法、属性
- `interfaces.ts` - 接口和类型定义
- `advanced.ts` - 高级特性：泛型、装饰器、模块

## 临时文件

`*.ast.json` 文件是临时生成的，已在 `.gitignore` 中排除。

## 注意事项

1. 每次添加新的示例代码时，先确保现有的节点类型工作正常
2. 使用 tree 命令深入理解复杂节点的结构
3. 实现节点构建器时，遵循现有的 `CreateNodeFn<T>` 依赖注入模式
4. 测试时注意检查生成的代码是否语法正确且语义等价
5. **使用 `bun test` 给比较复杂的代码逻辑加单测进行验证**，以替代写随机的测试脚本
6. **参考 TypeScript package 提供的 `typescript.d.ts`**，从中搜索可能会用到的函数和类型定义

## 实现技巧

### Template 字符串处理
在实现模板字符串相关节点时，需要注意：
- **TemplateHead** 包含 `` `Hello, ${` ``（包含开始反引号和 `${`）
- **TemplateTail** 包含 `}!` ``（包含 `}` 和结束反引号）
- **TemplateMiddle** 包含 `}...${`（包含前后的分隔符）

AST 在生成时，text 包含了 `${`、`}` 这些字符。除了最后一个字符区段，其他的都天然包含了 `${` 后缀；除了第一个区段，其他都包含了 `}` 前缀。

## 推荐的测试流程

### 完整测试工作流

1. **创建测试文件** - 在 `samples/` 目录下创建包含目标语法的 TypeScript 文件
2. **解析测试** - 运行 `bun run cli/index.ts parse <file>.ts` 查看 AST 结构
3. **实现节点** - 根据解析结果在 `src/ast-builder/nodes/` 下实现缺失的节点类型
4. **注册节点** - 在 `src/ast-builder/index.ts` 中导入并添加 case 分支
5. **生成测试** - 运行 `bun run cli/index.ts stringify <parsed>.json` 生成代码
6. **对比验证** - 使用 `diff` 命令比较原始文件与生成文件
7. **修复问题** - 根据差异调整节点实现逻辑
8. **提交代码** - 更新文档并提交改进

### 调试技巧

**查看节点结构：**
```bash
# 查看特定节点类型
bun run cli/index.ts parse file.ts | grep -A 5 "kind.*XXX"

# 查看节点详细信息
bun run cli/index.ts parse file.ts | grep -A 10 '"nodeId"'
```

**常见问题排查：**
- 导入/展开语法问题：检查 SyntaxList 的递归处理
- 模板字符串问题：注意 TemplateSpan 和 token 的处理顺序
- 解构赋值问题：确保 ObjectBindingPattern 和 BindingElement 的正确映射
- 类型注解问题：检查 TypeReference 和各种类型关键字的支持

## 🎯 高级调试经验教训

### 分治调试法 (Divide & Conquer Debugging)

当面对复杂的 AST 处理错误时，采用分治法可以快速定位问题：

#### 1. 错误现象识别
```bash
# 当看到类似错误时：
# Error: Debug Failure. Unhandled SyntaxKind: Unknown.
# 这通常意味着某个节点的 SyntaxKind 没有被正确设置
```

#### 2. 分治调试脚本
创建调试脚本逐个测试AST子树：
```typescript
// debug-subtree.ts 示例
const topLevelNodes = [
  { id: 'node1', type: 'TypeAliasDeclaration', name: 'NonNullable' },
  { id: 'node2', type: 'ClassDeclaration', name: 'Circle' }
];

for (const node of topLevelNodes) {
  try {
    // 创建只包含当前节点的子树AST
    const subtreeAST = createSubtreeAST(node.id);
    const result = stringify(subtreeAST);
    console.log(`✅ ${node.name} 成功`);
  } catch (error) {
    console.log(`❌ ${node.name} 失败: ${error.message}`);
  }
}
```

#### 3. 渐进式问题定位
```bash
# Step 1: 定位出错的顶级节点
bun debug-subtree.ts

# Step 2: 分析出错节点的结构  
bun run cli tree samples/file.ast.json -n problemNodeId

# Step 3: 创建最简复现案例
echo "class Circle { constructor(private radius: number) {} }" > simple-test.ts
bun run cli parse simple-test.ts
```

### 经验教训总结

#### ✅ 成功经验
1. **仔细观察，大胆假设，认真求证**
   - 观察：错误发生在参数处理阶段
   - 假设：问题出在构造函数参数的修饰符处理
   - 求证：创建简化测试用例验证假设

2. **分治法调试的威力**
   - 将复杂问题分解为可管理的小问题
   - 系统性地排除可能性，快速定位根因
   - 避免盲目猜测，提高调试效率

3. **渐进式测试策略**
   - 先测试简单情况，再测试复杂情况
   - 确保修复不会引入新问题
   - 建立完整的回归测试机制

#### ⚠️ 避免的陷阱
1. **忽视节点结构的复杂性**
   - 构造函数参数的 `private` 修饰符被包装在 `SyntaxList` 中
   - 不能假设第一个子节点就是参数名
   - 需要动态检测和处理不同的节点结构

2. **错误的调试方式**
   - ❌ 直接修改复杂文件试图解决问题
   - ❌ 盲目添加 console.log 而不系统化调试
   - ❌ 保留大量临时调试脚本污染代码库
   - ✅ 创建最简复现案例，专注核心问题
   - ✅ 使用临时调试脚本，用完即删

3. **忽视边界情况**
   - 处理修饰符时要考虑空修饰符列表的情况
   - 确保 `modifiers.length > 0 ? modifiers : undefined` 的正确处理

#### 🔧 实用调试工具模板

调试脚本应该是**临时工具** - 写完用完就删掉，不需要保留。重要的是掌握创建调试脚本的思路和模板：

```bash
# 临时分治调试脚本模板（用完即删）
cat > debug-temp.ts << 'EOF'
#!/usr/bin/env bun
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const nodes = [
  // 从 CLI children 命令获取需要测试的节点列表
];

for (const node of nodes) {
  try {
    // 根据具体问题定制测试逻辑
    const result = testSpecificNode(node);
    console.log(`✅ ${node.name} 成功`);
  } catch (error) {
    console.log(`❌ ${node.name}: ${error.message}`);
  }
}
EOF

# 使用完毕后删除
bun debug-temp.ts && rm debug-temp.ts
```

**调试脚本的生命周期:**
1. 🔨 **快速创建** - 根据具体问题临时编写
2. 🎯 **专注使用** - 定位问题根源
3. 🗑️ **立即删除** - 避免代码库污染

> **核心原则**: 调试脚本是消耗品，方法论和经验是资产。

#### 📋 问题解决检查清单

- [ ] 使用分治法定位具体出错的节点
- [ ] 创建最简复现案例
- [ ] 分析节点的完整子树结构
- [ ] 检查是否有被忽略的包装节点（如 SyntaxList）
- [ ] 确保所有子节点都有正确的 SyntaxKind
- [ ] 验证修复不影响其他功能
- [ ] 更新相关文档和进度文件
- [ ] 提交代码并清理临时调试文件

#### 💡 最佳实践

1. **预防为主**: 在实现新节点时，考虑所有可能的子节点组合
2. **文档驱动**: 及时更新 PROGRESS.md，记录支持的语法特性
3. **测试优先**: 为复杂逻辑编写单元测试，避免依赖手工验证
4. **临时工具化调试**: 快速编写临时调试脚本定位问题，用完即删
5. **保持代码库整洁**: 不保留临时调试文件，重视方法论传承

> **核心理念**: 通过系统化的方法论，将复杂的 AST 调试问题转化为可管理、可重现的小问题。调试脚本是临时工具，方法论和经验才是长期资产。
```
