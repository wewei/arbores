# AST Builder 待支持的语法结构清单

## 当前状态 (更新: 2025-07-21)
通过检查 stringify e2e 测试输出中的 "Unsupported" 节点，发现以下还需要支持的语法结构。

## 通过 e2e 测试发现的缺失语法支持 (实际需求)

### ✅ 已完成 (高优先级)
1. **PostfixUnaryExpression** ✅ DONE
   - 示例: `i++`, `j--`
   - 状态: 正确输出递增/递减操作

2. **NewExpression** ✅ DONE
   - 示例: `new Promise()`, `new Array()`  
   - 状态: 正确输出对象实例化

3. **AsExpression** ✅ DONE (类型断言)
   - 示例: `value as Type`, `obj as const`
   - 状态: 正确输出类型转换

4. **ElementAccessExpression** ✅ DONE  
   - 示例: `obj[key]`, `array[index]`
   - 状态: 正确输出动态属性访问

5. **NonNullExpression** ✅ DONE (非空断言)
   - 示例: `value!`
   - 状态: 正确输出非空断言操作

6. **ArrayBindingPattern** ✅ DONE (数组解构)
   - 示例: `const [a, b] = array`
   - 状态: 正确输出解构赋值

7. **YieldExpression** ✅ DONE
   - 示例: `yield value`
   - 状态: 正确输出 Generator 表达式

### 🟡 部分完成 (需要调试)
8. **ForOfStatement** 🔧 PARTIAL
   - 示例: `for (const item of items)`
   - 状态: 基本结构正确但表达式部分异常 `(() 而不是 items`
   - 需要: 修复表达式解析逻辑

9. **ThrowStatement** 🔧 PARTIAL
   - 示例: `throw new Error()`
   - 状态: 基本结构正确但缺少表达式 `throw ;;` 而不是 `throw new Error()`
   - 需要: 修复表达式查找逻辑

4. **ElementAccessExpression**
   - 示例: `obj[key]`, `array[index]`
   - 出现在: `advanced-features` 测试
   - 影响: 动态属性访问和数组索引

5. **NonNullExpression** (非空断言)
   - 示例: `value!`
   - 出现在: `advanced-features` 测试  
   - 影响: TypeScript 非空断言操作

### 🟡 中优先级 (功能完整性)

6. **ForOfStatement**
   - 示例: `for (const item of items)`
   - 出现在: `control-flow` 测试
   - 影响: 现代 JavaScript 循环语法

7. **ThrowStatement**
   - 示例: `throw new Error()`
   - 出现在: `control-flow` 测试
   - 影响: 错误处理

8. **YieldExpression**
   - 示例: `yield value`
   - 出现在: `advanced-features` 测试
   - 影响: Generator 函数支持

9. **ArrayBindingPattern** (数组解构)
   - 示例: `const [a, b] = array`
   - 出现在: `advanced-features` 测试
   - 影响: ES6 解构赋值

### 🟢 低优先级 (类型系统)

10. **IndexSignature** 
    - 示例: `[key: string]: any`
    - 出现在: `advanced-features` 测试
    - 影响: 索引签名支持

11. **TemplateLiteralType**
    - 示例: `type Path = \`/api/\${string}\``
    - 出现在: `advanced-features` 测试
    - 影响: 模板字符串类型

12. **MappedType** 
    - 示例: `{ [K in keyof T]: T[K] }`
    - 出现在: `generics-types` 测试
    - 影响: 高级类型映射

13. **TypeQuery**
    - 示例: `typeof value`
    - 出现在: `enum-const` 测试
    - 影响: 类型查询操作

### 🔵 特殊关键字

14. **ElseKeyword** 
    - 示例: `if (condition) {} else {}`
    - 出现在: `control-flow` 测试
    - 影响: 条件语句完整性

## 实现优先级建议

基于实际测试需求，推荐的实现顺序：

### 第一批 (解决循环和对象创建)
1. **PostfixUnaryExpression** - 修复 `i++` 循环问题
2. **NewExpression** - 支持对象实例化 
3. **ElementAccessExpression** - 支持数组/对象动态访问

### 第二批 (完善表达式支持)  
4. **AsExpression** - TypeScript 类型断言
5. **NonNullExpression** - TypeScript 非空断言
6. **ForOfStatement** - 现代循环语法

### 第三批 (错误处理和高级特性)
7. **ThrowStatement** - 错误处理
8. **YieldExpression** - Generator 支持
9. **ArrayBindingPattern** - 解构赋值

### 第四批 (类型系统完善)
10. **IndexSignature** - 索引签名
11. **TypeQuery** - typeof 类型查询  
12. **MappedType** - 映射类型
13. **TemplateLiteralType** - 模板字符串类型

## 当前已实现的节点类型 (20+)
✅ NumericLiteral, StringLiteral, BooleanLiteral, Identifier, ThisKeyword
✅ BinaryExpression, PropertyAccessExpression, AwaitExpression, CallExpression, ArrowFunction
✅ ObjectLiteralExpression, ArrayLiteralExpression, PropertyAssignment
✅ VariableDeclaration, VariableDeclarationList, FunctionDeclaration
✅ ClassDeclaration, InterfaceDeclaration, PropertyDeclaration, MethodDeclaration, PropertySignature
✅ Parameter, TypeReference (部分支持)

## 实现状态追踪

### 🔴 高优先级 (急需实现)
- [ ] **PostfixUnaryExpression** - 后缀自增/自减
- [ ] **NewExpression** - 对象实例化
- [ ] **AsExpression** - 类型断言 
- [ ] **ElementAccessExpression** - 动态属性访问
- [ ] **NonNullExpression** - 非空断言

### � 中优先级 (功能完整性)
- [ ] **ForOfStatement** - for...of 循环
- [ ] **ThrowStatement** - throw 语句
- [ ] **YieldExpression** - yield 表达式
- [ ] **ArrayBindingPattern** - 数组解构

### � 低优先级 (高级特性)
- [ ] **IndexSignature** - 索引签名
- [ ] **TemplateLiteralType** - 模板字符串类型
- [ ] **MappedType** - 映射类型
- [ ] **TypeQuery** - typeof 类型查询

### 🔵 特殊情况
- [ ] **ElseKeyword** - else 关键字处理

## 下一步行动计划

1. **🎯 当前焦点**: 实现 **PostfixUnaryExpression** 
   - 这是最频繁出现的缺失节点类型
   - 影响循环测试的核心功能

2. **🔄 测试验证策略**: 
   - 每实现一个节点类型后，运行相关的 stringify 测试
   - 通过 `Get-Content stdout.txt | Select-String "Unsupported"` 验证进度

3. **📊 进度跟踪**:
   - 实现前: 14 个 Unsupported 节点类型
   - 目标: 逐步减少到 0 个 Unsupported 节点

---
*此文档将随着实现进度更新*
