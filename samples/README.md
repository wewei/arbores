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
