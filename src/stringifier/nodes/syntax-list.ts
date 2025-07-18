import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { createFunctionDeclarationNode } from './function-declaration';
import { createVariableStatementNode } from './variable-statement';
import { createClassDeclarationNode } from './class-declaration';
import { createInterfaceDeclarationNode } from './interface-declaration';
import { createReturnStatementNode } from './return-statement';
import { createIfStatementNode } from './if-statement';
import { createBlockNode } from './block';
import { createBinaryExpressionNode } from './binary-expression';
import { createCallExpressionNode } from './call-expression';
import { createParameterNode } from './parameter';
import { createVariableDeclarationNode } from './variable-declaration';
import { createVariableDeclarationListNode } from './variable-declaration-list';
import { createObjectLiteralExpressionNode } from './object-literal-expression';
import { createPropertyAssignmentNode } from './property-assignment';
import { createArrayLiteralExpressionNode } from './array-literal-expression';
import { createTypeReferenceNode } from './type-reference';
import { createPropertyDeclarationNode } from './property-declaration';
import { createMethodDeclarationNode } from './method-declaration';
import { createConstructorNode } from './constructor';
import { createModifierNode } from './modifier';
import { createExpressionStatementNode } from './expression-statement';
import { createAwaitExpressionNode } from './await-expression';
import { createPropertyAccessExpressionNode } from './property-access-expression';
import { createParenthesizedExpressionNode } from './parenthesized-expression';
import { createTokenNode } from './token';

// 递归处理语法列表节点
export function createSyntaxListNode(node: ASTNode, ast: SourceFileAST): ts.NodeArray<ts.Node> {
  const nodes: ts.Node[] = [];
  if (node.children) {
    for (const childId of node.children) {
      const childNode = ast.nodes[childId];
      if (!childNode) continue;
      
      // 使用统一的节点创建函数
      const tsNode = createTSNode(childNode, ast);
      if (tsNode) {
        nodes.push(tsNode);
      }
    }
  }
  return ts.factory.createNodeArray(nodes);
}

// 使用现有的节点工厂创建 TypeScript 节点
function createTSNode(node: ASTNode, ast: SourceFileAST): ts.Node {
  switch (node.kind) {
    case ts.SyntaxKind.FunctionDeclaration:
      return createFunctionDeclarationNode(node, ast);
    case ts.SyntaxKind.VariableStatement:
      return createVariableStatementNode(node, ast);
    case ts.SyntaxKind.ClassDeclaration:
      return createClassDeclarationNode(node, ast);
    case ts.SyntaxKind.InterfaceDeclaration:
      return createInterfaceDeclarationNode(node, ast);
    case ts.SyntaxKind.Identifier:
      return ts.factory.createIdentifier(node.text || '');
    case ts.SyntaxKind.StringLiteral:
      return ts.factory.createStringLiteral(node.text || '');
    case ts.SyntaxKind.NumericLiteral:
      return ts.factory.createNumericLiteral(node.text || '0');
    case ts.SyntaxKind.TrueKeyword:
      return ts.factory.createTrue();
    case ts.SyntaxKind.FalseKeyword:
      return ts.factory.createFalse();
    case ts.SyntaxKind.ReturnStatement:
      return createReturnStatementNode(node, ast);
    case ts.SyntaxKind.IfStatement:
      return createIfStatementNode(node, ast);
    case ts.SyntaxKind.Block:
      return createBlockNode(node, ast);
    case ts.SyntaxKind.BinaryExpression:
      return createBinaryExpressionNode(node, ast);
    case ts.SyntaxKind.CallExpression:
      return createCallExpressionNode(node, ast);
    case ts.SyntaxKind.Parameter:
      return createParameterNode(node, ast);
    case ts.SyntaxKind.VariableDeclaration:
      return createVariableDeclarationNode(node, ast);
    case ts.SyntaxKind.VariableDeclarationList:
      return createVariableDeclarationListNode(node, ast);
    case ts.SyntaxKind.ObjectLiteralExpression:
      return createObjectLiteralExpressionNode(node, ast);
    case ts.SyntaxKind.PropertyAssignment:
      return createPropertyAssignmentNode(node, ast);
    case ts.SyntaxKind.ArrayLiteralExpression:
      return createArrayLiteralExpressionNode(node, ast);
    case ts.SyntaxKind.TypeReference:
      return createTypeReferenceNode(node, ast);
    case ts.SyntaxKind.PropertyDeclaration:
      return createPropertyDeclarationNode(node, ast);
    case ts.SyntaxKind.MethodDeclaration:
      return createMethodDeclarationNode(node, ast);
    case ts.SyntaxKind.Constructor:
      return createConstructorNode(node, ast);
    case ts.SyntaxKind.AsyncKeyword:
    case ts.SyntaxKind.PrivateKeyword:
    case ts.SyntaxKind.PublicKeyword:
    case ts.SyntaxKind.ProtectedKeyword:
    case ts.SyntaxKind.StaticKeyword:
    case ts.SyntaxKind.ReadonlyKeyword:
      return createModifierNode(node);
    case ts.SyntaxKind.ExpressionStatement:
      return createExpressionStatementNode(node, ast);
    case ts.SyntaxKind.AwaitExpression:
      return createAwaitExpressionNode(node, ast);
    case ts.SyntaxKind.PropertyAccessExpression:
      return createPropertyAccessExpressionNode(node, ast);
    case ts.SyntaxKind.ParenthesizedExpression:
      return createParenthesizedExpressionNode(node, ast);
    case ts.SyntaxKind.PlusToken:
    case ts.SyntaxKind.MinusToken:
    case ts.SyntaxKind.AsteriskToken:
    case ts.SyntaxKind.SlashToken:
    case ts.SyntaxKind.EqualsToken:
    case ts.SyntaxKind.SemicolonToken:
    case ts.SyntaxKind.CommaToken:
    case ts.SyntaxKind.DotToken:
    case ts.SyntaxKind.OpenParenToken:
    case ts.SyntaxKind.CloseParenToken:
    case ts.SyntaxKind.OpenBraceToken:
    case ts.SyntaxKind.CloseBraceToken:
    case ts.SyntaxKind.OpenBracketToken:
    case ts.SyntaxKind.CloseBracketToken:
      return createTokenNode(node);
    default:
      // 对于不支持的节点类型，返回一个占位符
      return ts.factory.createIdentifier(`/* Unsupported node type: ${ts.SyntaxKind[node.kind]} */`);
  }
} 