# AST Builder 待支持的语法结构清单

## 当前状态
通过检查 e2e 测试用例和 CLI stringify 输出，发现以下还需要支持的语法结构。

## 待实现的语法类型

### 基础类型和关键字
- [ ] **NullKeyword** - `null` 关键字
- [ ] **UndefinedKeyword** - `undefined` 关键字
- [ ] **VoidKeyword** - `void` 关键字
- [ ] **AnyKeyword** - `any` 关键字
- [ ] **NumberKeyword** - `number` 关键字
- [ ] **StringKeyword** - `string` 关键字
- [ ] **BooleanKeyword** - `boolean` 关键字

### 表达式和操作符
- [ ] **ConditionalExpression** - 三元运算符 `a ? b : c`
- [ ] **PostfixUnaryExpression** - 后缀运算符 `i++`, `j--`
- [ ] **PrefixUnaryExpression** - 前缀运算符 `++i`, `--j`, `!flag`, `-num`
- [ ] **TypeOfExpression** - `typeof` 表达式
- [ ] **VoidExpression** - `void` 表达式
- [ ] **DeleteExpression** - `delete` 表达式
- [ ] **SpreadElement** - 扩展语法 `...args`
- [ ] **TemplateExpression** - 模板字符串 `\`Hello \${name}\``
- [ ] **TaggedTemplateExpression** - 标签模板字符串
- [ ] **NewExpression** - `new` 表达式
- [ ] **AsExpression** - 类型断言 `value as Type`
- [ ] **NonNullExpression** - 非空断言 `value!`

### 语句类型
- [ ] **IfStatement** - `if` 语句
- [ ] **WhileStatement** - `while` 循环
- [ ] **ForStatement** - `for` 循环
- [ ] **ForInStatement** - `for...in` 循环
- [ ] **ForOfStatement** - `for...of` 循环
- [ ] **SwitchStatement** - `switch` 语句
- [ ] **CaseClause** - `case` 语句
- [ ] **DefaultClause** - `default` 语句
- [ ] **TryStatement** - `try...catch` 语句
- [ ] **ThrowStatement** - `throw` 语句
- [ ] **BreakStatement** - `break` 语句
- [ ] **ContinueStatement** - `continue` 语句

### 函数和类相关
- [ ] **Constructor** - 构造函数
- [ ] **GetAccessor** - getter 方法
- [ ] **SetAccessor** - setter 方法
- [ ] **FunctionExpression** - 函数表达式
- [ ] **MethodSignature** - 接口方法签名
- [ ] **CallSignature** - 调用签名
- [ ] **IndexSignature** - 索引签名

### 类型系统
- [ ] **UnionType** - 联合类型 `string | number`
- [ ] **IntersectionType** - 交叉类型 `A & B`
- [ ] **TypeLiteral** - 类型字面量
- [ ] **MappedType** - 映射类型
- [ ] **ConditionalType** - 条件类型
- [ ] **TypeQuery** - `typeof` 类型查询
- [ ] **IndexedAccessType** - 索引访问类型
- [ ] **TupleType** - 元组类型

### 模块和导入导出
- [ ] **ImportDeclaration** - `import` 声明
- [ ] **ExportDeclaration** - `export` 声明
- [ ] **ImportClause** - 导入子句
- [ ] **NamespaceImport** - 命名空间导入
- [ ] **NamedImports** - 具名导入
- [ ] **ImportSpecifier** - 导入说明符
- [ ] **ExportAssignment** - 导出赋值

### 装饰器和泛型
- [ ] **Decorator** - 装饰器
- [ ] **TypeParameter** - 类型参数
- [ ] **TypeParameterDeclaration** - 类型参数声明
- [ ] **TypeArguments** - 类型参数列表

### 高级结构
- [ ] **EnumDeclaration** - 枚举声明
- [ ] **EnumMember** - 枚举成员
- [ ] **ModuleDeclaration** - 模块声明
- [ ] **NamespaceDeclaration** - 命名空间声明
- [ ] **TypeAliasDeclaration** - 类型别名

## 优先级评估

### 高优先级 (Core Language Features)
1. **基础类型关键字** - 需要优先支持类型注解
2. **条件表达式和一元操作符** - 常见的表达式类型
3. **基本控制流语句** (if, for, while, switch)
4. **类型系统基础** (联合类型、类型引用的正确处理)

### 中优先级 (Common Usage)
1. **模板字符串和扩展操作符**
2. **try-catch 错误处理**
3. **构造函数和访问器**
4. **导入导出语句**

### 低优先级 (Advanced Features)
1. **装饰器**
2. **高级类型操作**
3. **模块和命名空间**

## 当前已实现的节点类型 (20+)
✅ NumericLiteral, StringLiteral, BooleanLiteral, Identifier, ThisKeyword
✅ BinaryExpression, PropertyAccessExpression, AwaitExpression, CallExpression, ArrowFunction
✅ ObjectLiteralExpression, ArrayLiteralExpression, PropertyAssignment
✅ VariableDeclaration, VariableDeclarationList, FunctionDeclaration
✅ ClassDeclaration, InterfaceDeclaration, PropertyDeclaration, MethodDeclaration, PropertySignature
✅ Parameter, TypeReference (部分支持)

## 下一步计划
1. ✅ **修复 JSON 解析问题** - 已修复：stringify 命令现在可以智能处理 .ts 和 .ast.json 文件
2. 实现控制流语句 (if, for, while, try-catch 等) - **当前高优先级**
3. 实现基础类型关键字 (number, string, boolean 等)
4. 完善 TypeReference 在类型注解中的正确处理  
5. 实现条件表达式和一元操作符
6. 添加枚举和类型别名支持

## 通过 e2e stringify 测试发现的缺失语法 (急需实现)

从运行 stringify 测试中发现以下语法结构仍然缺失支持：

### 🔴 高优先级 (造成 e2e 测试失败)
1. **控制流语句**: `IfStatement`, `ForStatement`, `WhileStatement`, `TryCatchStatement`
   - 状态: ❌ 未实现 (`stringify/control-flow` 测试失败)
   - 影响: 无法处理包含条件和循环的代码

### 🟡 中优先级 (功能完整性)
2. **基础表达式**: `ConditionalExpression`, `PrefixUnaryExpression`, `PostfixUnaryExpression`
   - 状态: ❌ 未实现
   - 影响: 三元操作符、++/-- 等常见表达式无法处理

3. **类型系统增强**: 泛型约束、映射类型、条件类型
   - 状态: ⚠️ 部分实现 (基本泛型已支持)
   - 影响: 高级 TypeScript 特性支持不完整

### 🟢 低优先级 (边缘情况)
4. **装饰器**: `Decorator` 相关语法
   - 状态: ❌ 未实现
   - 影响: 现代框架代码支持有限

---
*此文档将随着实现进度更新*
