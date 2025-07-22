import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../types';
import type { CreateNodeFn, NodeBuilderRegistry } from './types';

// 导入所有节点构建函数
import { createSourceFile } from './nodes/source-file';
import { createFunctionDeclaration } from './nodes/function-declaration';
import { createVariableStatement } from './nodes/variable-statement';
import { createVariableDeclarationList } from './nodes/variable-declaration-list';
import { createVariableDeclaration } from './nodes/variable-declaration';
import { createReturnStatement } from './nodes/return-statement';
import { createBlock } from './nodes/block';
import { createCallExpression } from './nodes/call-expression';
import { createBinaryExpression } from './nodes/binary-expression';
import { createAwaitExpression } from './nodes/await-expression';
import { createPropertyAccessExpression } from './nodes/property-access-expression';
import { createNumericLiteral } from './nodes/numeric-literal';
import { createStringLiteral } from './nodes/string-literal';
import { createBooleanLiteral } from './nodes/boolean-literal';
import { createPropertyAssignment } from './nodes/property-assignment';
import { createShorthandPropertyAssignment } from './nodes/shorthand-property-assignment';
import { createObjectLiteralExpression } from './nodes/object-literal-expression';
import { createArrayLiteralExpression } from './nodes/array-literal-expression';
import { createArrowFunction } from './nodes/arrow-function';
import { createParameter } from './nodes/parameter';
import { createTypeReference } from './nodes/type-reference';
import { createClassDeclaration } from './nodes/class-declaration';
import { createInterfaceDeclaration } from './nodes/interface-declaration';
import { createPropertyDeclaration } from './nodes/property-declaration';
import { createMethodDeclaration } from './nodes/method-declaration';
import { createMethodSignature } from './nodes/method-signature';
import { createPropertySignature } from './nodes/property-signature';
import { createIdentifier } from './nodes/identifier';
import { createLiteral } from './nodes/literal';
import { createToken } from './nodes/token';
import { createModifier } from './nodes/modifier';
import { createSyntaxList } from './nodes/syntax-list';
import { createTemplateExpression } from './nodes/template-expression';
import { createTemplateSpan } from './nodes/template-span';
import { createPrefixUnaryExpression } from './nodes/prefix-unary-expression';
import { createPostfixUnaryExpression } from './nodes/postfix-unary-expression';
import { createNewExpression } from './nodes/new-expression';
import { createElementAccessExpression } from './nodes/element-access-expression';
import { createAsExpression } from './nodes/as-expression';
import { createNonNullExpression } from './nodes/non-null-expression';
import { createForOfStatement } from './nodes/for-of-statement';
import { createThrowStatement } from './nodes/throw-statement';
import { createYieldExpression } from './nodes/yield-expression';
import { createArrayBindingPattern } from './nodes/array-binding-pattern';
import { createTupleType } from './nodes/tuple-type';
import { createMappedType } from './nodes/mapped-type';
import { createTemplateLiteralType } from './nodes/template-literal-type';
import { createTemplateLiteralTypeSpan } from './nodes/template-literal-type-span';
import { createIntersectionType } from './nodes/intersection-type';
import { createExpressionStatement } from './nodes/expression-statement';
import { createConditionalExpression } from './nodes/conditional-expression';
import { createTypeAliasDeclaration } from './nodes/type-alias-declaration';
import { createUnionType } from './nodes/union-type';
import { createLiteralType } from './nodes/literal-type';
import { createSpreadElement } from './nodes/spread-element';
import { createObjectBindingPattern } from './nodes/object-binding-pattern';
import { createBindingElement } from './nodes/binding-element';
import { createImportDeclaration } from './nodes/import-declaration';
import { createImportClause } from './nodes/import-clause';
import { createNamedImports } from './nodes/named-imports';
import { createImportSpecifier } from './nodes/import-specifier';
import { createTryStatement } from './nodes/try-statement';
import { createCatchClause } from './nodes/catch-clause';
import { createNullKeyword } from './nodes/null-keyword';
import { createTypeOfExpression } from './nodes/typeof-expression';
import { createIfStatement } from './nodes/if-statement';
import { createConstructorDeclaration } from './nodes/constructor-declaration';
import { createEnumDeclaration } from './nodes/enum-declaration';
import { createEnumMember } from './nodes/enum-member';
import { createModuleDeclaration } from './nodes/module-declaration';
import { createModuleBlock } from './nodes/module-block';
import { createQualifiedName } from './nodes/qualified-name';
import { createArrayType } from './nodes/array-type';
import { createTypeLiteral } from './nodes/type-literal';
import { createIndexedAccessType } from './nodes/indexed-access-type';
import { createConditionalType } from './nodes/conditional-type';
import { createUndefinedKeyword } from './nodes/undefined-keyword';
import { createIndexSignature } from './nodes/index-signature';
import { createTemplateHead } from './nodes/template-head';
import { createTypeQuery } from './nodes/type-query';
import { createElseKeyword } from './nodes/else-keyword';
import { createNeverKeyword } from './nodes/never-keyword';
import { createDotDotDotToken } from './nodes/dot-dot-dot-token';
import { createParenthesizedExpression } from './nodes/parenthesized-expression';
import { createForStatement } from './nodes/for-statement';
import { createFunctionType } from './nodes/function-type';
import { createTypeOperator } from './nodes/type-operator';
import { createTypeParameter } from './nodes/type-parameter';
import { createTypePredicate } from './nodes/type-predicate';
import { createUnknownKeyword } from './nodes/unknown-keyword';
import { createHeritageClause } from './nodes/heritage-clause';
import { createExpressionWithTypeArguments } from './nodes/expression-with-type-arguments';
import { createParenthesizedType } from './nodes/parenthesized-type';

// Export 相关节点
import { createExportDeclaration } from './nodes/export-declaration';
import { createExportAssignment } from './nodes/export-assignment';
import { createNamedExports } from './nodes/named-exports';
import { createExportSpecifier } from './nodes/export-specifier';

// 类型关键字节点
import { createNumberKeyword } from './nodes/number-keyword';
import { createStringKeyword } from './nodes/string-keyword';
import { createBooleanKeyword } from './nodes/boolean-keyword';
import { createAnyKeyword } from './nodes/any-keyword';
import { createVoidKeyword } from './nodes/void-keyword';

// JSDoc 相关节点
import { createJSDocComment } from './nodes/jsdoc-comment';

/**
 * 主要的节点创建函数
 * 这是整个系统的核心，根据 node.kind 调用相应的构建函数
 */
export function createNode<T extends ts.Node = ts.Node>(
  sourceFile: SourceFileAST,
  node: ASTNode
): T {
  const result = createNodeInternal<T>(sourceFile, node);
  
  // 处理 leadingComments
  if (node.leadingComments && node.leadingComments.length > 0) {
    const comments: ts.SynthesizedComment[] = node.leadingComments.map((comment, index) => {
      let commentText = comment.text;
      
      // 对于多行注释，移除包装的注释标记，但保留JSDoc格式
      if (comment.kind === 'MultiLineCommentTrivia') {
        // 检查是否是JSDoc格式（以 /** 开头）
        const isJSDoc = commentText.startsWith('/**');
        
        // 移除开头的 /** 或 /* 和结尾的 */
        commentText = commentText.replace(/^\/\*\*?/, '').replace(/\*\/$/, '');
        
        // 如果原来是JSDoc，在开头添加 * 来保持JSDoc格式
        if (isJSDoc) {
          commentText = '*' + commentText;
        }
      } else if (comment.kind === 'SingleLineCommentTrivia') {
        // 移除开头的 //
        commentText = commentText.replace(/^\/\//, '');
      }
      
      return {
        kind: comment.kind === 'MultiLineCommentTrivia' 
          ? ts.SyntaxKind.MultiLineCommentTrivia 
          : ts.SyntaxKind.SingleLineCommentTrivia,
        text: commentText,
        hasTrailingNewLine: true,
        pos: -1,
        end: -1
      };
    });
    
    ts.setSyntheticLeadingComments(result, comments);
  }
  
  return result;
}

function createNodeInternal<T extends ts.Node = ts.Node>(
  sourceFile: SourceFileAST,
  node: ASTNode
): T {
  switch (node.kind) {
    // 源文件节点
    case ts.SyntaxKind.SourceFile:
      return createSourceFile(createNodeInternal)(sourceFile, node) as unknown as T;
    
    // 声明节点
    case ts.SyntaxKind.FunctionDeclaration:
      return createFunctionDeclaration(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.VariableStatement:
      return createVariableStatement(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.VariableDeclarationList:
      return createVariableDeclarationList(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.VariableDeclaration:
      return createVariableDeclaration(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TypeAliasDeclaration:
      return createTypeAliasDeclaration(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ImportDeclaration:
      return createImportDeclaration(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ImportClause:
      return createImportClause(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.NamedImports:
      return createNamedImports(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ImportSpecifier:
      return createImportSpecifier(createNodeInternal)(sourceFile, node) as unknown as T;
    
    // JSDoc 相关节点
    case ts.SyntaxKind.JSDoc:
      // JSDoc 节点不应该作为独立节点创建，它们的内容应该通过 leadingComments 处理
      // 返回一个空的注释节点或者跳过
      return ts.factory.createJSDocComment("", undefined) as unknown as T;
    
    // Export 相关节点
    case ts.SyntaxKind.ExportDeclaration:
      return createExportDeclaration(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ExportAssignment:
      return createExportAssignment(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.NamedExports:
      return createNamedExports(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ExportSpecifier:
      return createExportSpecifier(createNodeInternal)(sourceFile, node) as unknown as T;
    
    // 语句节点
    case ts.SyntaxKind.Block:
      return createBlock(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ReturnStatement:
      return createReturnStatement(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ExpressionStatement:
      return createExpressionStatement(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TryStatement:
      return createTryStatement(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.CatchClause:
      return createCatchClause(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.IfStatement:
      return createIfStatement(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ForStatement:
      return createForStatement(createNodeInternal)(sourceFile, node) as unknown as T;
    
    // 表达式节点
    case ts.SyntaxKind.CallExpression:
      return createCallExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.BinaryExpression:
      return createBinaryExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.AwaitExpression:
      return createAwaitExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.PropertyAccessExpression:
      return createPropertyAccessExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TemplateExpression:
      return createTemplateExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TemplateHead:
      return createTemplateHead(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TemplateSpan:
      return createTemplateSpan(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.PrefixUnaryExpression:
      return createPrefixUnaryExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.PostfixUnaryExpression:
      return createPostfixUnaryExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.NewExpression:
      return createNewExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ElementAccessExpression:
      return createElementAccessExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.AsExpression:
      return createAsExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.NonNullExpression:
      return createNonNullExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ForOfStatement:
      return createForOfStatement(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ThrowStatement:
      return createThrowStatement(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.YieldExpression:
      return createYieldExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ArrayBindingPattern:
      return createArrayBindingPattern(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TupleType:
      return createTupleType(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.MappedType:
      return createMappedType(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TemplateLiteralType:
      return createTemplateLiteralType(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TemplateLiteralTypeSpan:
      return createTemplateLiteralTypeSpan(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.IntersectionType:
      return createIntersectionType(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ConditionalExpression:
      return createConditionalExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.SpreadElement:
      return createSpreadElement(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TypeOfExpression:
      return createTypeOfExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TypeQuery:
      return createTypeQuery(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ParenthesizedExpression:
      return createParenthesizedExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    
    // 字面量节点
    case ts.SyntaxKind.NumericLiteral:
      return createNumericLiteral(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.StringLiteral:
      return createStringLiteral(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
      return createBooleanLiteral(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ObjectLiteralExpression:
      return createObjectLiteralExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ArrayLiteralExpression:
      return createArrayLiteralExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.PropertyAssignment:
      return createPropertyAssignment(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ShorthandPropertyAssignment:
      return createShorthandPropertyAssignment(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ArrowFunction:
      return createArrowFunction(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.Parameter:
      return createParameter(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TypeReference:
      return createTypeReference(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.UnionType:
      return createUnionType(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.LiteralType:
      return createLiteralType(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ObjectBindingPattern:
      return createObjectBindingPattern(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.BindingElement:
      return createBindingElement(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ClassDeclaration:
      return createClassDeclaration(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.InterfaceDeclaration:
      return createInterfaceDeclaration(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.PropertyDeclaration:
      return createPropertyDeclaration(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.MethodDeclaration:
      return createMethodDeclaration(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.MethodSignature:
      return createMethodSignature(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.PropertySignature:
      return createPropertySignature(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.Constructor:
      return createConstructorDeclaration(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.EnumDeclaration:
      return createEnumDeclaration(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.EnumMember:
      return createEnumMember(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ModuleDeclaration:
      return createModuleDeclaration(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ModuleBlock:
      return createModuleBlock(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.QualifiedName:
      return createQualifiedName(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ArrayType:
      return createArrayType(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TypeLiteral:
      return createTypeLiteral(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.IndexedAccessType:
      return createIndexedAccessType(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.IndexSignature:
      return createIndexSignature(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ConditionalType:
      return createConditionalType(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TypeOperator:
      return createTypeOperator(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.FunctionType:
      return createFunctionType(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TypeParameter:
      return createTypeParameter(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TypePredicate:
      return createTypePredicate(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.HeritageClause:
      return createHeritageClause(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ExpressionWithTypeArguments:
      return createExpressionWithTypeArguments(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ParenthesizedExpression:
      return createParenthesizedExpression(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ParenthesizedType:
      return createParenthesizedType(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ForStatement:
      return createForStatement(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.DotDotDotToken:
      return createDotDotDotToken(createNodeInternal)(sourceFile, node) as unknown as T;
    
    // 基础节点
    case ts.SyntaxKind.Identifier:
      return createIdentifier(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ThisKeyword:
      return ts.factory.createThis() as unknown as T;
    
    // 字面量节点
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
      return createLiteral(createNodeInternal)(sourceFile, node) as unknown as T;
    
    // 关键字节点
    case ts.SyntaxKind.ElseKeyword:
      return createElseKeyword(createNodeInternal)(sourceFile, node) as T;
    
    // 修饰符节点
    case ts.SyntaxKind.ExportKeyword:
    case ts.SyntaxKind.DefaultKeyword:
    case ts.SyntaxKind.DeclareKeyword:
    case ts.SyntaxKind.AbstractKeyword:
    case ts.SyntaxKind.AsyncKeyword:
    case ts.SyntaxKind.PrivateKeyword:
    case ts.SyntaxKind.PublicKeyword:
    case ts.SyntaxKind.ProtectedKeyword:
    case ts.SyntaxKind.StaticKeyword:
    case ts.SyntaxKind.ReadonlyKeyword:
    case ts.SyntaxKind.ConstKeyword:
    case ts.SyntaxKind.LetKeyword:
    case ts.SyntaxKind.VarKeyword:
      return createModifier(createNodeInternal)(sourceFile, node) as unknown as T;
    
    // Token 节点
    case ts.SyntaxKind.OpenParenToken:
    case ts.SyntaxKind.CloseParenToken:
    case ts.SyntaxKind.OpenBraceToken:
    case ts.SyntaxKind.CloseBraceToken:
    case ts.SyntaxKind.SemicolonToken:
    case ts.SyntaxKind.CommaToken:
    case ts.SyntaxKind.DotToken:
    case ts.SyntaxKind.ColonToken:
    case ts.SyntaxKind.EqualsToken:
    case ts.SyntaxKind.PlusToken:
    case ts.SyntaxKind.MinusToken:
    case ts.SyntaxKind.AsteriskToken:
    case ts.SyntaxKind.SlashToken:
    case ts.SyntaxKind.QuestionToken:
    case ts.SyntaxKind.BarToken:
    case ts.SyntaxKind.IsKeyword:
    case ts.SyntaxKind.TypeKeyword:
    case ts.SyntaxKind.InterfaceKeyword:
    case ts.SyntaxKind.FunctionKeyword:
    case ts.SyntaxKind.ClassKeyword:
    case ts.SyntaxKind.EnumKeyword:
    case ts.SyntaxKind.NamespaceKeyword:
    case ts.SyntaxKind.AbstractKeyword:
    case ts.SyntaxKind.OpenBracketToken:
    case ts.SyntaxKind.CloseBracketToken:
    case ts.SyntaxKind.EndOfFileToken:
    // Add missing tokens identified from debug output
    case ts.SyntaxKind.LessThanToken:
    case ts.SyntaxKind.GreaterThanToken:
    case ts.SyntaxKind.ExtendsKeyword:
    case ts.SyntaxKind.ConstructorKeyword:
    case ts.SyntaxKind.EqualsEqualsEqualsToken:
    case ts.SyntaxKind.AsteriskAsteriskToken:
    case ts.SyntaxKind.ReturnKeyword:
    case ts.SyntaxKind.IfKeyword:
    case ts.SyntaxKind.TypeOfKeyword:
    case ts.SyntaxKind.ThisKeyword:
    case ts.SyntaxKind.SuperKeyword:
    case ts.SyntaxKind.EqualsGreaterThanToken:
    case ts.SyntaxKind.ExportKeyword:
      return createToken(createNodeInternal)(sourceFile, node) as unknown as T;
    
    // 特殊节点
    case ts.SyntaxKind.SyntaxList:
      return createSyntaxList(createNodeInternal)(sourceFile, node) as unknown as T;
    
    // 类型关键字节点
    case ts.SyntaxKind.NumberKeyword:
      return createNumberKeyword(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.StringKeyword:
      return createStringKeyword(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.BooleanKeyword:
      return createBooleanKeyword(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.AnyKeyword:
      return createAnyKeyword(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.VoidKeyword:
      return createVoidKeyword(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.NullKeyword:
      return createNullKeyword(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.UndefinedKeyword:
      return createUndefinedKeyword(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.UnknownKeyword:
      return createUnknownKeyword(createNodeInternal)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.NeverKeyword:
      return createNeverKeyword(createNodeInternal)(sourceFile, node) as unknown as T;
    
    // 未支持的节点类型，生成占位符
    default:
      const kindName = ts.SyntaxKind[node.kind] || `Unknown(${node.kind})`;
      
      // Debug信息（可选择性显示）
      if (process.env.DEBUG_UNSUPPORTED) {
        console.warn(`⚠️  Unsupported node type: ${kindName} (${node.kind})`);
        console.warn(`⚠️  Node details:`, { 
          id: node.id, 
          kind: node.kind, 
          kindName: kindName,
          text: node.text, 
          children: node.children,
          properties: node.properties
        });
      }
      
      // 生成占位符
      const placeholderComment = `/* Unsupported: ${kindName} */`;
      return ts.factory.createIdentifier(placeholderComment) as unknown as T;
  }
}

// 导出主要的创建函数
export { createNode as default };

// 也导出类型
export type { CreateNodeFn, NodeBuilderFn } from './types';
