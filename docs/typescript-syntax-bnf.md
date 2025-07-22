# TypeScript AST 语法结构参考 (BNF)

本文档定义了TypeScript语法的BNF语法，作为Arbores类型化AST节点设计的参考标准。

> 📝 **说明**: 此文档替代了原有的typescript-ast-reference.md，提供更系统化的语法定义。

## 基础符号

```bnf
// 字面量
<Identifier> ::= /[a-zA-Z_$][a-zA-Z0-9_$]*/
<StringLiteral> ::= '"' /[^"]*/ '"' | "'" /[^']*/ "'"
<NumericLiteral> ::= /[0-9]+(\.[0-9]+)?/
<BooleanLiteral> ::= "true" | "false"
<NullLiteral> ::= "null"
<UndefinedLiteral> ::= "undefined"

// 操作符
<AssignmentOperator> ::= "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "<<=" | ">>=" | ">>>=" | "&=" | "|=" | "^="
<BinaryOperator> ::= "+" | "-" | "*" | "/" | "%" | "==" | "!=" | "===" | "!==" | "<" | ">" | "<=" | ">=" | "&&" | "||" | "&" | "|" | "^" | "<<" | ">>" | ">>>"
<UnaryOperator> ::= "+" | "-" | "!" | "~" | "++" | "--" | "typeof" | "void" | "delete"
```

## 核心语法结构

### 1. 源文件结构

```bnf
<SourceFile> ::= <Statement>*

<Statement> ::= <ExpressionStatement>
              | <VariableStatement>
              | <FunctionDeclaration>
              | <ClassDeclaration>
              | <InterfaceDeclaration>
              | <TypeAliasDeclaration>
              | <EnumDeclaration>
              | <ImportDeclaration>
              | <ExportDeclaration>
              | <Block>
              | <IfStatement>
              | <WhileStatement>
              | <ForStatement>
              | <DoStatement>
              | <SwitchStatement>
              | <TryStatement>
              | <ThrowStatement>
              | <ReturnStatement>
              | <BreakStatement>
              | <ContinueStatement>
```

### 2. 声明语句

```bnf
<VariableStatement> ::= <VariableDeclarationList> ";"

<VariableDeclarationList> ::= ("const" | "let" | "var") <VariableDeclaration> ("," <VariableDeclaration>)*

<VariableDeclaration> ::= <Identifier> <TypeAnnotation>? <Initializer>?

<TypeAnnotation> ::= ":" <TypeNode>

<Initializer> ::= "=" <Expression>

<FunctionDeclaration> ::= "async"? "function" "*"? <Identifier> <TypeParameters>? <ParameterList> <TypeAnnotation>? <Block>

<ParameterList> ::= "(" <Parameter>? ("," <Parameter>)* ")"

<Parameter> ::= <Identifier> "?"? <TypeAnnotation>? <Initializer>?
              | <RestParameter>

<RestParameter> ::= "..." <Identifier> <TypeAnnotation>?
```

### 3. 类和接口

```bnf
<ClassDeclaration> ::= <Modifier>* "class" <Identifier> <TypeParameters>? <HeritageClause>? "{" <ClassElement>* "}"

<InterfaceDeclaration> ::= "interface" <Identifier> <TypeParameters>? <HeritageClause>? "{" <InterfaceElement>* "}"

<TypeAliasDeclaration> ::= "type" <Identifier> <TypeParameters>? "=" <TypeNode> ";"

<ClassElement> ::= <PropertyDeclaration>
                 | <MethodDeclaration>
                 | <GetAccessorDeclaration>
                 | <SetAccessorDeclaration>
                 | <ConstructorDeclaration>

<InterfaceElement> ::= <PropertySignature>
                     | <MethodSignature>
                     | <CallSignature>
                     | <ConstructSignature>
                     | <IndexSignature>

<Modifier> ::= "public" | "private" | "protected" | "static" | "readonly" | "abstract" | "async" | "export" | "default"
```

### 4. 表达式

```bnf
<Expression> ::= <AssignmentExpression>

<AssignmentExpression> ::= <ConditionalExpression>
                         | <LeftHandSideExpression> <AssignmentOperator> <AssignmentExpression>

<ConditionalExpression> ::= <LogicalOrExpression>
                          | <LogicalOrExpression> "?" <AssignmentExpression> ":" <AssignmentExpression>

<LogicalOrExpression> ::= <LogicalAndExpression>
                        | <LogicalOrExpression> "||" <LogicalAndExpression>

<LogicalAndExpression> ::= <BitwiseOrExpression>
                         | <LogicalAndExpression> "&&" <BitwiseOrExpression>

<BitwiseOrExpression> ::= <BitwiseXorExpression>
                        | <BitwiseOrExpression> "|" <BitwiseXorExpression>

<BitwiseXorExpression> ::= <BitwiseAndExpression>
                         | <BitwiseXorExpression> "^" <BitwiseAndExpression>

<BitwiseAndExpression> ::= <EqualityExpression>
                         | <BitwiseAndExpression> "&" <EqualityExpression>

<EqualityExpression> ::= <RelationalExpression>
                       | <EqualityExpression> ("==" | "!=" | "===" | "!==") <RelationalExpression>

<RelationalExpression> ::= <ShiftExpression>
                         | <RelationalExpression> ("<" | ">" | "<=" | ">=" | "instanceof" | "in") <ShiftExpression>

<ShiftExpression> ::= <AdditiveExpression>
                    | <ShiftExpression> ("<<" | ">>" | ">>>") <AdditiveExpression>

<AdditiveExpression> ::= <MultiplicativeExpression>
                       | <AdditiveExpression> ("+" | "-") <MultiplicativeExpression>

<MultiplicativeExpression> ::= <UnaryExpression>
                             | <MultiplicativeExpression> ("*" | "/" | "%") <UnaryExpression>

<UnaryExpression> ::= <PostfixExpression>
                    | <UnaryOperator> <UnaryExpression>
                    | "await" <UnaryExpression>

<PostfixExpression> ::= <LeftHandSideExpression>
                      | <LeftHandSideExpression> "++"
                      | <LeftHandSideExpression> "--"

<LeftHandSideExpression> ::= <NewExpression>
                           | <CallExpression>

<NewExpression> ::= <MemberExpression>
                  | "new" <NewExpression>

<CallExpression> ::= <MemberExpression> <Arguments>
                   | <CallExpression> <Arguments>
                   | <CallExpression> "[" <Expression> "]"
                   | <CallExpression> "." <Identifier>

<MemberExpression> ::= <PrimaryExpression>
                     | <MemberExpression> "[" <Expression> "]"
                     | <MemberExpression> "." <Identifier>
                     | "new" <MemberExpression> <Arguments>

<PrimaryExpression> ::= "this"
                      | <Identifier>
                      | <Literal>
                      | <ArrayLiteralExpression>
                      | <ObjectLiteralExpression>
                      | <FunctionExpression>
                      | <ArrowFunction>
                      | <ParenthesizedExpression>
```

### 5. 字面量表达式

```bnf
<ArrayLiteralExpression> ::= "[" <ElementList>? "]"

<ElementList> ::= <AssignmentExpression>? ("," <AssignmentExpression>?)*

<ObjectLiteralExpression> ::= "{" <PropertyAssignmentList>? "}"

<PropertyAssignmentList> ::= <PropertyAssignment> ("," <PropertyAssignment>)*

<PropertyAssignment> ::= <PropertyName> ":" <AssignmentExpression>
                       | <GetAccessor>
                       | <SetAccessor>
                       | <Identifier>

<PropertyName> ::= <Identifier>
                 | <StringLiteral>
                 | <NumericLiteral>
                 | <ComputedPropertyName>

<ComputedPropertyName> ::= "[" <AssignmentExpression> "]"
```

### 6. 函数和箭头函数

```bnf
<FunctionExpression> ::= "async"? "function" "*"? <Identifier>? <TypeParameters>? <ParameterList> <TypeAnnotation>? <Block>

<ArrowFunction> ::= "async"? <ArrowParameters> "=>" <ArrowBody>

<ArrowParameters> ::= <Identifier>
                    | <ParameterList>

<ArrowBody> ::= <AssignmentExpression>
              | <Block>
```

### 7. 类型系统

```bnf
<TypeNode> ::= <PrimaryType>
             | <UnionType>
             | <IntersectionType>
             | <FunctionType>
             | <ConstructorType>
             | <ArrayType>
             | <TupleType>

<PrimaryType> ::= <Identifier>
                | <TypeReference>
                | <TypePredicate>
                | <TypeQuery>
                | <ThisType>
                | <LiteralType>
                | <ParenthesizedType>
                | <TypeLiteral>

<TypeReference> ::= <Identifier> <TypeArguments>?

<TypeArguments> ::= "<" <TypeNode> ("," <TypeNode>)* ">"

<UnionType> ::= <TypeNode> "|" <TypeNode>

<IntersectionType> ::= <TypeNode> "&" <TypeNode>

<ArrayType> ::= <TypeNode> "[" "]"

<TupleType> ::= "[" <TypeNode> ("," <TypeNode>)* "]"

<FunctionType> ::= <TypeParameters>? <ParameterList> "=>" <TypeNode>

<TypeLiteral> ::= "{" <TypeElement>* "}"

<TypeElement> ::= <PropertySignature>
                | <CallSignature>
                | <ConstructSignature>
                | <IndexSignature>
                | <MethodSignature>
```

### 8. 控制流语句

```bnf
<IfStatement> ::= "if" "(" <Expression> ")" <Statement> ("else" <Statement>)?

<WhileStatement> ::= "while" "(" <Expression> ")" <Statement>

<ForStatement> ::= "for" "(" <ForInitializer>? ";" <Expression>? ";" <Expression>? ")" <Statement>
                 | "for" "(" <ForBinding> ("in" | "of") <Expression> ")" <Statement>

<DoStatement> ::= "do" <Statement> "while" "(" <Expression> ")" ";"

<SwitchStatement> ::= "switch" "(" <Expression> ")" "{" <CaseClause>* <DefaultClause>? <CaseClause>* "}"

<CaseClause> ::= "case" <Expression> ":" <Statement>*

<DefaultClause> ::= "default" ":" <Statement>*

<TryStatement> ::= "try" <Block> <CatchClause>? <FinallyClause>?

<CatchClause> ::= "catch" "(" <Identifier> <TypeAnnotation>? ")" <Block>

<FinallyClause> ::= "finally" <Block>
```

### 9. 模块系统

```bnf
<ImportDeclaration> ::= "import" <ImportClause> "from" <StringLiteral> ";"
                      | "import" <StringLiteral> ";"

<ImportClause> ::= <Identifier>
                 | <NamespaceImport>
                 | <NamedImports>
                 | <Identifier> "," <NamespaceImport>
                 | <Identifier> "," <NamedImports>

<NamespaceImport> ::= "*" "as" <Identifier>

<NamedImports> ::= "{" <ImportSpecifier> ("," <ImportSpecifier>)* "}"

<ImportSpecifier> ::= <Identifier>
                    | <Identifier> "as" <Identifier>

<ExportDeclaration> ::= "export" <ExportClause> "from" <StringLiteral> ";"
                      | "export" <ExportClause> ";"
                      | "export" "*" "from" <StringLiteral> ";"
                      | "export" "*" "as" <Identifier> "from" <StringLiteral> ";"
                      | "export" "=" <Expression> ";"

<ExportClause> ::= "{" <ExportSpecifier> ("," <ExportSpecifier>)* "}"

<ExportSpecifier> ::= <Identifier>
                    | <Identifier> "as" <Identifier>
```

## SyntaxKind 映射关系

每个BNF规则对应一个或多个TypeScript SyntaxKind：

- `<SourceFile>` → `SourceFile` (307)
- `<Identifier>` → `Identifier` (80)
- `<StringLiteral>` → `StringLiteral` (11)
- `<NumericLiteral>` → `NumericLiteral` (9)
- `<FunctionDeclaration>` → `FunctionDeclaration` (262)
- `<VariableDeclaration>` → `VariableDeclaration` (260)
- `<ClassDeclaration>` → `ClassDeclaration` (263)
- `<InterfaceDeclaration>` → `InterfaceDeclaration` (264)
- `<TypeAliasDeclaration>` → `TypeAliasDeclaration` (265)
- ... (共399个SyntaxKind)

## 实现策略

1. **优先级排序**：按使用频率和重要性实现
2. **渐进式实现**：每个节点类型独立实现和测试
3. **Roundtrip验证**：确保双向转换无损
4. **版本同步**：与TypeScript编译器版本保持一致

## 参考资料

- [TypeScript Language Specification](https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md)
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [TypeScript AST Viewer](https://ts-ast-viewer.com/)
