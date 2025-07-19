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

// 类型关键字节点
import { createNumberKeyword } from './nodes/number-keyword';
import { createStringKeyword } from './nodes/string-keyword';
import { createBooleanKeyword } from './nodes/boolean-keyword';
import { createAnyKeyword } from './nodes/any-keyword';
import { createVoidKeyword } from './nodes/void-keyword';

/**
 * 主要的节点创建函数
 * 这是整个系统的核心，根据 node.kind 调用相应的构建函数
 */
export function createNode<T extends ts.Node = ts.Node>(
  sourceFile: SourceFileAST,
  node: ASTNode
): T {
  switch (node.kind) {
    // 源文件节点
    case ts.SyntaxKind.SourceFile:
      return createSourceFile(createNode)(sourceFile, node) as unknown as T;
    
    // 声明节点
    case ts.SyntaxKind.FunctionDeclaration:
      return createFunctionDeclaration(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.VariableStatement:
      return createVariableStatement(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.VariableDeclarationList:
      return createVariableDeclarationList(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.VariableDeclaration:
      return createVariableDeclaration(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TypeAliasDeclaration:
      return createTypeAliasDeclaration(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ImportDeclaration:
      return createImportDeclaration(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ImportClause:
      return createImportClause(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.NamedImports:
      return createNamedImports(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ImportSpecifier:
      return createImportSpecifier(createNode)(sourceFile, node) as unknown as T;
    
    // 语句节点
    case ts.SyntaxKind.Block:
      return createBlock(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ReturnStatement:
      return createReturnStatement(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ExpressionStatement:
      return createExpressionStatement(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TryStatement:
      return createTryStatement(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.CatchClause:
      return createCatchClause(createNode)(sourceFile, node) as unknown as T;
    
    // 表达式节点
    case ts.SyntaxKind.CallExpression:
      return createCallExpression(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.BinaryExpression:
      return createBinaryExpression(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.AwaitExpression:
      return createAwaitExpression(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.PropertyAccessExpression:
      return createPropertyAccessExpression(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TemplateExpression:
      return createTemplateExpression(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TemplateSpan:
      return createTemplateSpan(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.PrefixUnaryExpression:
      return createPrefixUnaryExpression(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ConditionalExpression:
      return createConditionalExpression(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.SpreadElement:
      return createSpreadElement(createNode)(sourceFile, node) as unknown as T;
    
    // 字面量节点
    case ts.SyntaxKind.NumericLiteral:
      return createNumericLiteral(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.StringLiteral:
      return createStringLiteral(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
      return createBooleanLiteral(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ObjectLiteralExpression:
      return createObjectLiteralExpression(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ArrayLiteralExpression:
      return createArrayLiteralExpression(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.PropertyAssignment:
      return createPropertyAssignment(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ArrowFunction:
      return createArrowFunction(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.Parameter:
      return createParameter(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.TypeReference:
      return createTypeReference(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.UnionType:
      return createUnionType(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.LiteralType:
      return createLiteralType(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ObjectBindingPattern:
      return createObjectBindingPattern(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.BindingElement:
      return createBindingElement(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ClassDeclaration:
      return createClassDeclaration(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.InterfaceDeclaration:
      return createInterfaceDeclaration(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.PropertyDeclaration:
      return createPropertyDeclaration(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.MethodDeclaration:
      return createMethodDeclaration(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.MethodSignature:
      return createMethodSignature(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.PropertySignature:
      return createPropertySignature(createNode)(sourceFile, node) as unknown as T;
    
    // 基础节点
    case ts.SyntaxKind.Identifier:
      return createIdentifier(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ThisKeyword:
      return ts.factory.createThis() as unknown as T;
    
    // 字面量节点
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
      return createLiteral(createNode)(sourceFile, node) as unknown as T;
    
    // 修饰符节点
    case ts.SyntaxKind.AsyncKeyword:
    case ts.SyntaxKind.PrivateKeyword:
    case ts.SyntaxKind.PublicKeyword:
    case ts.SyntaxKind.ProtectedKeyword:
    case ts.SyntaxKind.StaticKeyword:
    case ts.SyntaxKind.ReadonlyKeyword:
    case ts.SyntaxKind.ConstKeyword:
    case ts.SyntaxKind.LetKeyword:
    case ts.SyntaxKind.VarKeyword:
      return createModifier(createNode)(sourceFile, node) as unknown as T;
    
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
      return createToken(createNode)(sourceFile, node) as unknown as T;
    
    // 特殊节点
    case ts.SyntaxKind.SyntaxList:
      return createSyntaxList(createNode)(sourceFile, node) as unknown as T;
    
    // 类型关键字节点
    case ts.SyntaxKind.NumberKeyword:
      return createNumberKeyword(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.StringKeyword:
      return createStringKeyword(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.BooleanKeyword:
      return createBooleanKeyword(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.AnyKeyword:
      return createAnyKeyword(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.VoidKeyword:
      return createVoidKeyword(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.NullKeyword:
      return createNullKeyword(createNode)(sourceFile, node) as unknown as T;
    
    // 未支持的节点类型
    default:
      console.warn(`Unsupported node type: ${ts.SyntaxKind[node.kind]} (${node.kind})`);
      console.warn(`Node details:`, { id: node.id, kind: node.kind, text: node.text, children: node.children });
      return ts.factory.createIdentifier(`/* Unsupported: ${ts.SyntaxKind[node.kind]} */`) as unknown as T;
  }
}

// 导出主要的创建函数
export { createNode as default };

// 也导出类型
export type { CreateNodeFn, NodeBuilderFn } from './types';
