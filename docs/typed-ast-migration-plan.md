# Typed AST 重构计划

## 设计原则

### 通用 ASTNode vs Typed AST Node

| 字段 | 通用ASTNode | Typed AST Node | 说明 |
|------|-------------|----------------|------|
| `id` | ✅ 保留 | ✅ 保留 | 节点唯一标识符 |
| `kind` | ✅ 保留 | ✅ 保留 | SyntaxKind数值 |
| `text` | ✅ 保留 | ❌ 移除 | 原始文本，在类型化节点中用具体属性替代 |
| `children` | ✅ 保留 | ❌ 移除 | 子节点ID列表，在类型化节点中用强类型属性替代 |
| `properties` | 🔄 将移除 | ❌ 不需要 | 临时性字段，被强类型属性替代 |
| `leadingComments` | ✅ 保留 | ✅ 保留 | 前导注释 |
| `trailingComments` | ✅ 保留 | ✅ 保留 | 尾随注释 |

## 重构阶段

### Phase 1: 完善 Typed AST 基础架构 ✅

- [x] 创建 `BaseTypedNode` 接口
- [x] 生成所有 SyntaxKind 对应的类型文件
- [x] 实现转换器模板

### Phase 2: 逐步实现具体节点类型

- [ ] 实现核心节点类型（Function, Variable, Class, Interface）
- [ ] 为每个节点类型定义强类型属性
- [ ] 实现双向转换器

### Phase 3: 更新 Parser

- [ ] 修改 parser 使用 Typed AST 转换器
- [ ] 移除 `extractNodeProperties` 函数
- [ ] 从通用 ASTNode 中移除 `properties` 字段

### Phase 4: 向后兼容

- [ ] 确保现有 AST 文件格式兼容
- [ ] 更新文档和示例

## 类型化节点设计示例

### StringLiteral

```typescript
export interface StringLiteralNode extends BaseTypedNode {
  kind: 11;
  value: string;           // 实际字符串值（不含引号）
  quoteKind: '"' | "'" | '`'; // 引号类型
  isUnterminated?: boolean; // 是否未终止
}
```

### FunctionDeclaration

```typescript
export interface FunctionDeclarationNode extends BaseTypedNode {
  kind: 262;
  name?: string;                    // 函数名
  parameters: ParameterNode[];      // 参数列表
  returnType?: TypeNode;           // 返回类型
  body?: BlockNode;                // 函数体
  isAsync: boolean;                // 是否异步
  isGenerator: boolean;            // 是否生成器
  modifiers?: ModifierNode[];      // 修饰符
}
```

## 移除的临时代码

以下代码在完成重构后可以移除：

1. `src/core/utils/ast-processing.ts` 中的 `extractNodeProperties`
2. `src/core/types.ts` 中 ASTNode 的 `properties` 字段
3. Parser 中对 `extractNodeProperties` 的调用

## 好处

1. **类型安全**: 编译时检查节点属性
2. **代码可读性**: 明确的语义属性
3. **IDE 支持**: 自动补全和类型提示
4. **维护性**: 减少运行时错误
5. **性能**: 避免通用属性查找

## 向后兼容策略

- 保持现有 JSON AST 文件格式不变
- 通过转换器实现新旧格式转换
- 现有 CLI 工具继续正常工作
