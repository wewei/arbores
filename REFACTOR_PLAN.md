# 代码重构建议

## 问题描述

当前代码库中存在重复的 `createTSNode` 函数实现，出现在以下文件中：

1. `src/stringifier/index.ts` - 主要的、最完整的实现
2. `src/stringifier/nodes/syntax-list.ts` - 重复实现
3. `src/stringifier/nodes/source-file.ts` - 重复实现  
4. `src/stringifier/node-factory.ts` - 未完成的重构尝试

## 重构建议

### 方案1：参数化函数接口

1. **定义统一的类型**：
   ```typescript
   export type CreateTSNodeFn = (node: ASTNode, ast: SourceFileAST) => ts.Node;
   ```

2. **更新所有节点创建函数**：
   - 为所有 `createXXXNode` 函数添加 `CreateTSNodeFn` 参数
   - 使用传入的函数而不是内部重复实现

3. **主要好处**：
   - 完全消除代码重复
   - 提高代码的可维护性
   - 易于扩展和测试

### 方案2：共享模块

1. **创建核心模块**：
   - 将主要的 `createTSNode` 函数移到 `src/stringifier/core.ts`
   - 其他模块导入并使用这个函数

2. **更新导入**：
   - 删除重复的函数实现
   - 使用导入的核心函数

3. **主要好处**：
   - 实现简单
   - 保持现有接口不变
   - 更易于渐进式重构

## 当前状态

- ✅ 已识别所有重复代码位置
- ✅ 在重复函数旁添加了 TODO 注释
- ✅ 记录了重构建议
- ⏳ 待实现：选择并执行重构方案

## 影响评估

重构将影响以下功能：
- AST 节点字符串化
- 递归节点处理
- 各种节点类型的创建逻辑

建议在重构前确保有完整的测试覆盖。

## 实现步骤

1. 选择重构方案
2. 创建测试用例确保行为一致
3. 实现重构（建议分阶段进行）
4. 验证所有功能正常
5. 清理代码和注释
