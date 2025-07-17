import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { createBinaryExpressionNode } from './binary-expression';
import { createCallExpressionNode } from './call-expression';
import { createPropertyAccessExpressionNode } from './property-access-expression';
import { createAwaitExpressionNode } from './await-expression';

// 创建返回语句节点
export function createReturnStatementNode(node: ASTNode, ast: SourceFileAST): ts.ReturnStatement {
  const children = node.children || [];
  // 查找第一个表达式类型的子节点
  const expressionNodeId = children.find(childId => {
    const childNode = ast.nodes[childId];
    return childNode && (
      childNode.kind === ts.SyntaxKind.BinaryExpression ||
      childNode.kind === ts.SyntaxKind.Identifier ||
      childNode.kind === ts.SyntaxKind.CallExpression ||
      childNode.kind === ts.SyntaxKind.PropertyAccessExpression ||
      childNode.kind === ts.SyntaxKind.AwaitExpression ||
      childNode.kind === ts.SyntaxKind.NumericLiteral ||
      childNode.kind === ts.SyntaxKind.StringLiteral
    );
  });

  let expression: ts.Expression | undefined;
  if (expressionNodeId) {
    const exprNode = ast.nodes[expressionNodeId];
    if (exprNode) {
      switch (exprNode.kind) {
        case ts.SyntaxKind.BinaryExpression:
          expression = createBinaryExpressionNode(exprNode, ast);
          break;
        case ts.SyntaxKind.Identifier:
          expression = ts.factory.createIdentifier(exprNode.text || '');
          break;
        case ts.SyntaxKind.NumericLiteral:
          expression = ts.factory.createNumericLiteral(exprNode.text || '0');
          break;
        case ts.SyntaxKind.StringLiteral:
          expression = ts.factory.createStringLiteral(exprNode.text || '');
          break;
        case ts.SyntaxKind.CallExpression:
          expression = createCallExpressionNode(exprNode, ast);
          break;
        case ts.SyntaxKind.PropertyAccessExpression:
          expression = createPropertyAccessExpressionNode(exprNode, ast);
          break;
        case ts.SyntaxKind.AwaitExpression:
          expression = createAwaitExpressionNode(exprNode, ast);
          break;
        default:
          expression = ts.factory.createIdentifier('expr');
      }
    }
  }

  return ts.factory.createReturnStatement(expression);
} 