# Typed AST 实现检查清单

> 确保所有 357 个 TypeScript SyntaxKind 类型都得到完整实现  
> 生成时间: 2025-07-23  
> 状态: 🚧 开发中

## 📋 概览

- **总计**: 357 个语法种类 (SyntaxKind 1-357，跳过 0-Unknown)
- **已生成模板**: ✅ 357/357 类型定义 + 357/357 转换器
- **已实现功能**: 🚧 0/357 (待实现具体逻辑)

## 🎯 实现状态统计

| 类别 | 总数 | 已实现 | 进度 |
|------|------|--------|------|
| **Token 类型** | 82 | 0 | 0% |
| **关键字类型** | 83 | 0 | 0% |
| **节点类型** | 192 | 0 | 0% |
| **总计** | **357** | **0** | **0%** |

## 📝 详细检查列表

### 🔤 Token 类型 (1-82)

#### 基础 Token (1-18)
- [ ] `s001` EndOfFileToken
- [ ] `s002` SingleLineCommentTrivia  
- [ ] `s003` MultiLineCommentTrivia
- [ ] `s004` NewLineTrivia
- [ ] `s005` WhitespaceTrivia
- [ ] `s006` ShebangTrivia
- [ ] `s007` ConflictMarkerTrivia
- [ ] `s008` NonTextFileMarkerTrivia
- [ ] `s009` NumericLiteral
- [ ] `s010` BigIntLiteral
- [ ] `s011` StringLiteral
- [ ] `s012` JsxText
- [ ] `s013` JsxTextAllWhiteSpaces
- [ ] `s014` RegularExpressionLiteral
- [ ] `s015` NoSubstitutionTemplateLiteral
- [ ] `s016` TemplateHead
- [ ] `s017` TemplateMiddle
- [ ] `s018` TemplateTail

#### 标点符号 Token (19-63)
- [ ] `s019` OpenBraceToken
- [ ] `s020` CloseBraceToken
- [ ] `s021` OpenParenToken
- [ ] `s022` CloseParenToken
- [ ] `s023` OpenBracketToken
- [ ] `s024` CloseBracketToken
- [ ] `s025` DotToken
- [ ] `s026` DotDotDotToken
- [ ] `s027` SemicolonToken
- [ ] `s028` CommaToken
- [ ] `s029` QuestionDotToken
- [ ] `s030` LessThanToken
- [ ] `s031` LessThanSlashToken
- [ ] `s032` GreaterThanToken
- [ ] `s033` LessThanEqualsToken
- [ ] `s034` GreaterThanEqualsToken
- [ ] `s035` EqualsEqualsToken
- [ ] `s036` ExclamationEqualsToken
- [ ] `s037` EqualsEqualsEqualsToken
- [ ] `s038` ExclamationEqualsEqualsToken
- [ ] `s039` EqualsGreaterThanToken
- [ ] `s040` PlusToken
- [ ] `s041` MinusToken
- [ ] `s042` AsteriskToken
- [ ] `s043` AsteriskAsteriskToken
- [ ] `s044` SlashToken
- [ ] `s045` PercentToken
- [ ] `s046` PlusPlusToken
- [ ] `s047` MinusMinusToken
- [ ] `s048` LessThanLessThanToken
- [ ] `s049` GreaterThanGreaterThanToken
- [ ] `s050` GreaterThanGreaterThanGreaterThanToken
- [ ] `s051` AmpersandToken
- [ ] `s052` BarToken
- [ ] `s053` CaretToken
- [ ] `s054` ExclamationToken
- [ ] `s055` TildeToken
- [ ] `s056` AmpersandAmpersandToken
- [ ] `s057` BarBarToken
- [ ] `s058` QuestionToken
- [ ] `s059` ColonToken
- [ ] `s060` AtToken
- [ ] `s061` QuestionQuestionToken
- [ ] `s062` BacktickToken
- [ ] `s063` HashToken

#### 赋值操作符 Token (64-82)
- [ ] `s064` EqualsToken
- [ ] `s065` PlusEqualsToken
- [ ] `s066` MinusEqualsToken
- [ ] `s067` AsteriskEqualsToken
- [ ] `s068` AsteriskAsteriskEqualsToken
- [ ] `s069` SlashEqualsToken
- [ ] `s070` PercentEqualsToken
- [ ] `s071` LessThanLessThanEqualsToken
- [ ] `s072` GreaterThanGreaterThanEqualsToken
- [ ] `s073` GreaterThanGreaterThanGreaterThanEqualsToken
- [ ] `s074` AmpersandEqualsToken
- [ ] `s075` BarEqualsToken
- [ ] `s076` BarBarEqualsToken
- [ ] `s077` AmpersandAmpersandEqualsToken
- [ ] `s078` QuestionQuestionEqualsToken
- [ ] `s079` CaretEqualsToken
- [ ] `s080` Identifier
- [ ] `s081` PrivateIdentifier
- [ ] `s082` JSDocCommentTextToken

### 🔑 关键字类型 (83-165)

#### 基础关键字 (83-127)
- [ ] `s083` BreakKeyword
- [ ] `s084` CaseKeyword
- [ ] `s085` CatchKeyword
- [ ] `s086` ClassKeyword
- [ ] `s087` ConstKeyword
- [ ] `s088` ContinueKeyword
- [ ] `s089` DebuggerKeyword
- [ ] `s090` DefaultKeyword
- [ ] `s091` DeleteKeyword
- [ ] `s092` DoKeyword
- [ ] `s093` ElseKeyword
- [ ] `s094` EnumKeyword
- [ ] `s095` ExportKeyword
- [ ] `s096` ExtendsKeyword
- [ ] `s097` FalseKeyword
- [ ] `s098` FinallyKeyword
- [ ] `s099` ForKeyword
- [ ] `s100` FunctionKeyword
- [ ] `s101` IfKeyword
- [ ] `s102` ImportKeyword
- [ ] `s103` InKeyword
- [ ] `s104` InstanceOfKeyword
- [ ] `s105` NewKeyword
- [ ] `s106` NullKeyword
- [ ] `s107` ReturnKeyword
- [ ] `s108` SuperKeyword
- [ ] `s109` SwitchKeyword
- [ ] `s110` ThisKeyword
- [ ] `s111` ThrowKeyword
- [ ] `s112` TrueKeyword
- [ ] `s113` TryKeyword
- [ ] `s114` TypeOfKeyword
- [ ] `s115` VarKeyword
- [ ] `s116` VoidKeyword
- [ ] `s117` WhileKeyword
- [ ] `s118` WithKeyword
- [ ] `s119` ImplementsKeyword
- [ ] `s120` InterfaceKeyword
- [ ] `s121` LetKeyword
- [ ] `s122` PackageKeyword
- [ ] `s123` PrivateKeyword
- [ ] `s124` ProtectedKeyword
- [ ] `s125` PublicKeyword
- [ ] `s126` StaticKeyword
- [ ] `s127` YieldKeyword

#### TypeScript 扩展关键字 (128-165)
- [ ] `s128` AbstractKeyword
- [ ] `s129` AccessorKeyword
- [ ] `s130` AsKeyword
- [ ] `s131` AssertsKeyword
- [ ] `s132` AssertKeyword
- [ ] `s133` AnyKeyword
- [ ] `s134` AsyncKeyword
- [ ] `s135` AwaitKeyword
- [ ] `s136` BooleanKeyword
- [ ] `s137` ConstructorKeyword
- [ ] `s138` DeclareKeyword
- [ ] `s139` GetKeyword
- [ ] `s140` InferKeyword
- [ ] `s141` IntrinsicKeyword
- [ ] `s142` IsKeyword
- [ ] `s143` KeyOfKeyword
- [ ] `s144` ModuleKeyword
- [ ] `s145` NamespaceKeyword
- [ ] `s146` NeverKeyword
- [ ] `s147` OutKeyword
- [ ] `s148` ReadonlyKeyword
- [ ] `s149` RequireKeyword
- [ ] `s150` NumberKeyword
- [ ] `s151` ObjectKeyword
- [ ] `s152` SatisfiesKeyword
- [ ] `s153` SetKeyword
- [ ] `s154` StringKeyword
- [ ] `s155` SymbolKeyword
- [ ] `s156` TypeKeyword
- [ ] `s157` UndefinedKeyword
- [ ] `s158` UniqueKeyword
- [ ] `s159` UnknownKeyword
- [ ] `s160` UsingKeyword
- [ ] `s161` FromKeyword
- [ ] `s162` GlobalKeyword
- [ ] `s163` BigIntKeyword
- [ ] `s164` OverrideKeyword
- [ ] `s165` OfKeyword

### 🌳 AST 节点类型 (166-357)

#### 基础节点 (166-181)
- [ ] `s166` QualifiedName
- [ ] `s167` ComputedPropertyName
- [ ] `s168` TypeParameter
- [ ] `s169` Parameter
- [ ] `s170` Decorator
- [ ] `s171` PropertySignature
- [ ] `s172` PropertyDeclaration
- [ ] `s173` MethodSignature
- [ ] `s174` MethodDeclaration
- [ ] `s175` ClassStaticBlockDeclaration
- [ ] `s176` Constructor
- [ ] `s177` GetAccessor
- [ ] `s178` SetAccessor
- [ ] `s179` CallSignature
- [ ] `s180` ConstructSignature
- [ ] `s181` IndexSignature

#### 类型节点 (182-205)
- [ ] `s182` TypePredicate
- [ ] `s183` TypeReference
- [ ] `s184` FunctionType
- [ ] `s185` ConstructorType
- [ ] `s186` TypeQuery
- [ ] `s187` TypeLiteral
- [ ] `s188` ArrayType
- [ ] `s189` TupleType
- [ ] `s190` OptionalType
- [ ] `s191` RestType
- [ ] `s192` UnionType
- [ ] `s193` IntersectionType
- [ ] `s194` ConditionalType
- [ ] `s195` InferType
- [ ] `s196` ParenthesizedType
- [ ] `s197` ThisType
- [ ] `s198` TypeOperator
- [ ] `s199` IndexedAccessType
- [ ] `s200` MappedType
- [ ] `s201` LiteralType
- [ ] `s202` NamedTupleMember
- [ ] `s203` TemplateLiteralType
- [ ] `s204` TemplateLiteralTypeSpan
- [ ] `s205` ImportType

#### 绑定模式 (206-208)
- [ ] `s206` ObjectBindingPattern
- [ ] `s207` ArrayBindingPattern
- [ ] `s208` BindingElement

#### 表达式节点 (209-239)
- [ ] `s209` ArrayLiteralExpression
- [ ] `s210` ObjectLiteralExpression
- [ ] `s211` PropertyAccessExpression
- [ ] `s212` ElementAccessExpression
- [ ] `s213` CallExpression
- [ ] `s214` NewExpression
- [ ] `s215` TaggedTemplateExpression
- [ ] `s216` TypeAssertionExpression
- [ ] `s217` ParenthesizedExpression
- [ ] `s218` FunctionExpression
- [ ] `s219` ArrowFunction
- [ ] `s220` DeleteExpression
- [ ] `s221` TypeOfExpression
- [ ] `s222` VoidExpression
- [ ] `s223` AwaitExpression
- [ ] `s224` PrefixUnaryExpression
- [ ] `s225` PostfixUnaryExpression
- [ ] `s226` BinaryExpression
- [ ] `s227` ConditionalExpression
- [ ] `s228` TemplateExpression
- [ ] `s229` YieldExpression
- [ ] `s230` SpreadElement
- [ ] `s231` ClassExpression
- [ ] `s232` OmittedExpression
- [ ] `s233` ExpressionWithTypeArguments
- [ ] `s234` AsExpression
- [ ] `s235` NonNullExpression
- [ ] `s236` MetaProperty
- [ ] `s237` SyntheticExpression
- [ ] `s238` SatisfiesExpression
- [ ] `s239` TemplateSpan

#### 语句节点 (240-270)
- [ ] `s240` SemicolonClassElement
- [ ] `s241` Block
- [ ] `s242` EmptyStatement
- [ ] `s243` VariableStatement
- [ ] `s244` ExpressionStatement
- [ ] `s245` IfStatement
- [ ] `s246` DoStatement
- [ ] `s247` WhileStatement
- [ ] `s248` ForStatement
- [ ] `s249` ForInStatement
- [ ] `s250` ForOfStatement
- [ ] `s251` ContinueStatement
- [ ] `s252` BreakStatement
- [ ] `s253` ReturnStatement
- [ ] `s254` WithStatement
- [ ] `s255` SwitchStatement
- [ ] `s256` LabeledStatement
- [ ] `s257` ThrowStatement
- [ ] `s258` TryStatement
- [ ] `s259` DebuggerStatement
- [ ] `s260` VariableDeclaration
- [ ] `s261` VariableDeclarationList
- [ ] `s262` FunctionDeclaration
- [ ] `s263` ClassDeclaration
- [ ] `s264` InterfaceDeclaration
- [ ] `s265` TypeAliasDeclaration
- [ ] `s266` EnumDeclaration
- [ ] `s267` ModuleDeclaration
- [ ] `s268` ModuleBlock
- [ ] `s269` CaseBlock
- [ ] `s270` NamespaceExportDeclaration

#### 导入导出节点 (271-283)
- [ ] `s271` ImportEqualsDeclaration
- [ ] `s272` ImportDeclaration
- [ ] `s273` ImportClause
- [ ] `s274` NamespaceImport
- [ ] `s275` NamedImports
- [ ] `s276` ImportSpecifier
- [ ] `s277` ExportAssignment
- [ ] `s278` ExportDeclaration
- [ ] `s279` NamedExports
- [ ] `s280` NamespaceExport
- [ ] `s281` ExportSpecifier
- [ ] `s282` MissingDeclaration
- [ ] `s283` ExternalModuleReference

#### JSX 节点 (284-295)
- [ ] `s284` JsxElement
- [ ] `s285` JsxSelfClosingElement
- [ ] `s286` JsxOpeningElement
- [ ] `s287` JsxClosingElement
- [ ] `s288` JsxFragment
- [ ] `s289` JsxOpeningFragment
- [ ] `s290` JsxClosingFragment
- [ ] `s291` JsxAttribute
- [ ] `s292` JsxAttributes
- [ ] `s293` JsxSpreadAttribute
- [ ] `s294` JsxExpression
- [ ] `s295` JsxNamespacedName

#### 子句和其他节点 (296-308)
- [ ] `s296` CaseClause
- [ ] `s297` DefaultClause
- [ ] `s298` HeritageClause
- [ ] `s299` CatchClause
- [ ] `s300` AssertClause
- [ ] `s301` AssertEntry
- [ ] `s302` ImportTypeAssertionContainer
- [ ] `s303` PropertyAssignment
- [ ] `s304` ShorthandPropertyAssignment
- [ ] `s305` SpreadAssignment
- [ ] `s306` EnumMember
- [ ] `s307` SourceFile
- [ ] `s308` Bundle

#### JSDoc 节点 (309-351)
- [ ] `s309` JSDocTypeExpression
- [ ] `s310` JSDocNameReference
- [ ] `s311` JSDocMemberName
- [ ] `s312` JSDocAllType
- [ ] `s313` JSDocUnknownType
- [ ] `s314` JSDocNullableType
- [ ] `s315` JSDocNonNullableType
- [ ] `s316` JSDocOptionalType
- [ ] `s317` JSDocFunctionType
- [ ] `s318` JSDocVariadicType
- [ ] `s319` JSDocNamepathType
- [ ] `s320` JSDocComment
- [ ] `s321` JSDocText
- [ ] `s322` JSDocTypeLiteral
- [ ] `s323` JSDocSignature
- [ ] `s324` JSDocLink
- [ ] `s325` JSDocLinkCode
- [ ] `s326` JSDocLinkPlain
- [ ] `s327` JSDocTag
- [ ] `s328` JSDocAugmentsTag
- [ ] `s329` JSDocImplementsTag
- [ ] `s330` JSDocAuthorTag
- [ ] `s331` JSDocDeprecatedTag
- [ ] `s332` JSDocClassTag
- [ ] `s333` JSDocPublicTag
- [ ] `s334` JSDocPrivateTag
- [ ] `s335` JSDocProtectedTag
- [ ] `s336` JSDocReadonlyTag
- [ ] `s337` JSDocOverrideTag
- [ ] `s338` JSDocCallbackTag
- [ ] `s339` JSDocOverloadTag
- [ ] `s340` JSDocEnumTag
- [ ] `s341` JSDocParameterTag
- [ ] `s342` JSDocReturnTag
- [ ] `s343` JSDocThisTag
- [ ] `s344` JSDocTypeTag
- [ ] `s345` JSDocTemplateTag
- [ ] `s346` JSDocTypedefTag
- [ ] `s347` JSDocSeeTag
- [ ] `s348` JSDocPropertyTag
- [ ] `s349` JSDocThrowsTag
- [ ] `s350` JSDocSatisfiesTag
- [ ] `s351` JSDocImportTag

#### 编译器内部节点 (352-357)
- [ ] `s352` SyntaxList
- [ ] `s353` NotEmittedStatement
- [ ] `s354` NotEmittedTypeElement
- [ ] `s355` PartiallyEmittedExpression
- [ ] `s356` CommaListExpression
- [ ] `s357` SyntheticReferenceExpression

## 🚀 实现指南

### 阶段 1: 基础实现
1. **简单 Token 类型** (优先级: 高)
   - 标点符号、关键字等无子节点的类型
   - 实现基本的属性映射和转换逻辑

2. **字面量类型** (优先级: 高)
   - `NumericLiteral`, `StringLiteral`, `BooleanLiteral` 等
   - 添加 `value` 属性的强类型支持

### 阶段 2: 核心节点
1. **标识符和名称** (优先级: 高)
   - `Identifier`, `QualifiedName` 等
   - 实现名称解析和作用域相关功能

2. **基础表达式** (优先级: 中)
   - `BinaryExpression`, `CallExpression` 等
   - 添加操作符和参数的强类型支持

### 阶段 3: 复杂结构
1. **声明节点** (优先级: 中)
   - `FunctionDeclaration`, `ClassDeclaration` 等
   - 实现声明相关的元数据和修饰符

2. **类型系统** (优先级: 中)
   - `TypeReference`, `UnionType`, `IntersectionType` 等
   - 添加类型推导和检查支持

### 阶段 4: 高级功能
1. **JSDoc 节点** (优先级: 低)
   - 文档注释相关的类型
   - 实现文档解析和生成功能

2. **编译器内部** (优先级: 低)
   - `SyntaxList`, `SyntheticExpression` 等
   - 处理编译器内部使用的节点类型

## 📋 实现检查项

对于每个类型，需要完成以下检查项：

### 类型定义文件 (`types/sXXX-*.ts`)
- [ ] 定义了强类型接口
- [ ] 添加了特定属性（如 `value`, `name`, `operator` 等）
- [ ] 继承了正确的基础接口
- [ ] 添加了完整的 JSDoc 注释

### 转换器文件 (`converters/sXXX-*.ts`)
- [ ] `fromASTNode`: ASTNode → TypedNode 转换
- [ ] `toASTNode`: TypedNode → ASTNode 转换  
- [ ] `fromTsNode`: ts.Node → TypedNode 转换
- [ ] `toTsNode`: TypedNode → ts.Node 转换
- [ ] 所有函数都有完整实现（非 TODO）
- [ ] 添加了错误处理和验证
- [ ] 添加了完整的单元测试

### 集成测试
- [ ] 端到端转换测试
- [ ] 与现有 AST 系统的兼容性测试
- [ ] 性能基准测试

## 🎯 优先级建议

### P0 (立即实现)
1. `Identifier` (s080) - 标识符
2. `StringLiteral` (s011) - 字符串字面量
3. `NumericLiteral` (s009) - 数字字面量
4. `BooleanLiteral` (s097/s112) - 布尔字面量

### P1 (短期实现)
1. 基础表达式类型
2. 简单语句类型
3. 基础声明类型

### P2 (中期实现)
1. 复杂类型系统节点
2. 模块系统节点
3. JSX 相关节点

### P3 (长期实现)
1. JSDoc 相关节点
2. 编译器内部节点
3. 高级类型系统特性

---

**更新日志:**
- 2025-07-23: 创建初始检查清单
- 待补充: 第一个类型实现完成时间

**注意事项:**
- 每完成一个类型的实现，请在对应的复选框中打勾 ✅
- 建议按优先级顺序实现，确保核心功能优先
- 每个阶段完成后更新进度统计
