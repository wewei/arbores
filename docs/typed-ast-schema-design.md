# Typed AST Schema 设计文档

> 基于 JSON Schema 的数据驱动类型化 AST 系统设计  
> 作者: TypeScript AST Team  
> 创建时间: 2025-07-23  
> 版本: 1.0

## 🎯 设计目标

### 核心原则
1. **数据驱动**: 通过 JSON Schema 描述节点结构，自动生成类型定义和转换器
2. **递归支持**: 正确处理 AST 的递归特性和循环引用
3. **类型安全**: 确保编译时和运行时的类型安全
4. **可维护性**: 单一数据源，避免重复定义
5. **标准兼容**: 基于 JSON Schema Draft 7 标准

### 解决的问题
- **手动维护成本高**: 357 个类型 × 4 个转换函数 = 1428 个函数
- **递归转换复杂**: 当前转换器签名无法处理子节点递归
- **类型不一致**: 缺乏统一的类型约束和验证
- **重复定义**: 表达式、语句类型联合在多处重复

## 📁 文件结构设计

```
src/core/typed-ast/schemas/
├── base/                           # 基础接口 (手写)
│   ├── base-typed-node.schema.json
│   ├── base-token-node.schema.json
│   ├── base-literal-node.schema.json
│   ├── base-expression-node.schema.json
│   ├── base-statement-node.schema.json
│   └── base-declaration-node.schema.json
├── common/                         # 公共类型联合 (手写)
│   ├── type-unions.schema.json
│   ├── operator-types.schema.json
│   └── modifier-types.schema.json
├── tokens/                         # Token 类型 (生成)
│   ├── s001-end-of-file-token.schema.json
│   ├── s080-identifier.schema.json
│   └── ...
├── keywords/                       # 关键字类型 (生成)
│   ├── s083-break-keyword.schema.json
│   └── ...
├── expressions/                    # 表达式类型 (生成)
│   ├── s213-call-expression.schema.json
│   └── ...
├── statements/                     # 语句类型 (生成)
│   ├── s245-if-statement.schema.json
│   └── ...
├── declarations/                   # 声明类型 (生成)
│   ├── s262-function-declaration.schema.json
│   └── ...
├── types/                          # 类型节点 (生成)
│   ├── s183-type-reference.schema.json
│   └── ...
└── index.json                      # Schema 索引和元数据
```

## 🔧 Schema 设计规范

### 1. 基础接口继承

所有 Schema 必须通过 `allOf` 继承相应的基础接口：

```json
{
  "allOf": [
    { "$ref": "../base/base-token-node" },
    { "type": "object", "properties": { ... } }
  ]
}
```

### 2. 类型联合复用

使用公共类型联合避免重复定义：

```json
{
  "expression": { "$ref": "../common/type-unions#/definitions/Expression" },
  "statements": { 
    "type": "array",
    "items": { "$ref": "../common/type-unions#/definitions/Statement" }
  }
}
```

### 3. 循环引用处理

通过引用层打破直接循环：

```json
// common/type-unions.schema.json
{
  "definitions": {
    "Expression": {
      "anyOf": [
        { "$ref": "../tokens/s080-identifier" },
        { "$ref": "../expressions/s226-binary-expression" }
      ]
    }
  }
}
```

### 4. 元数据约定

每个 Schema 包含生成器元数据：

```json
{
  "metadata": {
    "category": "expression|statement|declaration|token|keyword|type",
    "baseType": "BaseExpressionNode",
    "conversion": {
      "children": {
        "expression": "required-expression",
        "statements": "optional-array-statement"
      },
      "properties": {
        "text": "node.text || ''",
        "value": "parseValue(node.text)"
      }
    }
  }
}
```

## 📋 Schema 类别定义

### Token 类型 (s001-s082)
- **基础接口**: `BaseTokenNode`
- **特征**: 包含 `text` 属性，通常无子节点
- **示例**: Identifier, StringLiteral, NumericLiteral

### 关键字类型 (s083-s165)  
- **基础接口**: `BaseTokenNode`
- **特征**: 固定的 `text` 值，无子节点
- **示例**: IfKeyword, ClassKeyword, FunctionKeyword

### 表达式类型 (s209-s239)
- **基础接口**: `BaseExpressionNode`
- **特征**: 可递归包含其他表达式
- **示例**: BinaryExpression, CallExpression, ArrowFunction

### 语句类型 (s240-s270)
- **基础接口**: `BaseStatementNode`
- **特征**: 可包含表达式和其他语句
- **示例**: IfStatement, ForStatement, BlockStatement

### 声明类型 (s262-s267, s271-s283)
- **基础接口**: `BaseDeclarationNode`
- **特征**: 声明新的符号或模块
- **示例**: FunctionDeclaration, ClassDeclaration, ImportDeclaration

### 类型节点 (s182-s205)
- **基础接口**: `BaseTypeNode`
- **特征**: TypeScript 类型系统相关
- **示例**: TypeReference, UnionType, IntersectionType

## 🔄 转换器生成规则

### 函数签名标准化

```typescript
// 基础转换器接口
interface NodeConverter {
  fromASTNode(node: ASTNode, converter: UniversalConverter): TypedNode;
  toASTNode(node: TypedNode, converter: UniversalConverter): ASTNode;
  fromTsNode(node: ts.Node, converter: UniversalConverter): TypedNode;
  toTsNode(node: TypedNode, factory: ts.NodeFactory): ts.Node;
}

// 通用转换器
interface UniversalConverter {
  convert(node: ASTNode | ts.Node): TypedNode;
  convertArray<T>(nodes: (ASTNode | ts.Node)[]): T[];
}
```

### 子节点转换策略

基于 metadata.conversion.children 自动生成递归转换逻辑：

```typescript
// required-expression
expression: converter.convert(findChildExpression(node)) as ExpressionNode

// optional-statement  
statement: (() => {
  const child = findChildStatement(node);
  return child ? converter.convert(child) as StatementNode : undefined;
})()

// required-array-expression
expressions: node.children
  .filter(isExpression)
  .map(child => converter.convert(child) as ExpressionNode)
```

## 📊 生成器配置

### index.json 结构

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TypeScript AST Schema Registry",
  "version": "1.0.0",
  "metadata": {
    "generator": {
      "outputPaths": {
        "types": "src/core/typed-ast/types/",
        "converters": "src/core/typed-ast/converters/",
        "tests": "src/core/typed-ast/__tests__/"
      },
      "templateEngine": "handlebars",
      "validation": true
    }
  },
  "categories": {
    "tokens": { "range": [1, 82], "baseType": "BaseTokenNode" },
    "keywords": { "range": [83, 165], "baseType": "BaseTokenNode" },
    "expressions": { "kinds": [209, 211, 213, 226, 234], "baseType": "BaseExpressionNode" },
    "statements": { "kinds": [241, 244, 245, 247, 253], "baseType": "BaseStatementNode" }
  },
  "schemas": {
    "base": [
      "base/base-typed-node.schema.json",
      "base/base-token-node.schema.json"
    ],
    "generated": [
      "tokens/*.schema.json",
      "keywords/*.schema.json", 
      "expressions/*.schema.json",
      "statements/*.schema.json"
    ]
  }
}
```

## 🎯 实施计划

### 阶段 1: 基础设施
1. ✅ 创建设计文档
2. 🔄 编写 Schema 生成脚本
3. 📝 手写基础 Schema (base/, common/)
4. 🧪 创建 Schema 验证工具

### 阶段 2: 核心类型
1. 生成 Token 和 Keyword Schema
2. 实现通用转换器引擎
3. 生成简单表达式 Schema
4. 验证递归转换逻辑

### 阶段 3: 复杂类型
1. 生成语句和声明 Schema
2. 处理复杂的循环引用
3. 优化转换器性能
4. 完善错误处理

### 阶段 4: 完善与优化
1. 生成完整的 357 个 Schema
2. 性能基准测试
3. 文档和示例完善
4. 集成测试覆盖

## 📚 参考资料

- [JSON Schema Draft 7 Specification](https://json-schema.org/draft-07/schema)
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [AST Node Types Reference](https://ts-ast-viewer.com/)

---

**注意事项:**
- 所有生成的文件都应包含警告注释，避免手动修改
- Schema 修改后需要重新生成相关的 TypeScript 代码
- 保持 Schema ID 的唯一性和一致性
- 定期验证 Schema 的有效性和一致性
