import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { createCallExpressionNode } from './call-expression';
import { createBinaryExpressionNode } from './binary-expression';

// 创建表达式语句节点
export function createExpressionStatementNode(node: ASTNode, ast: SourceFileAST): ts.ExpressionStatement {
  const children = node.children || [];
  let expr: ts.Expression = ts.factory.createIdentifier('expr');
  if (children.length > 0 && children[0]) {
    const exprNode = ast.nodes[children[0]];
    if (exprNode) {
      switch (exprNode.kind) {
        case ts.SyntaxKind.Identifier:
          expr = ts.factory.createIdentifier(exprNode.text || '');
          break;
        case ts.SyntaxKind.CallExpression:
          expr = createCallExpressionNode(exprNode, ast);
          break;
        case ts.SyntaxKind.BinaryExpression:
          expr = createBinaryExpressionNode(exprNode, ast);
          break;
        default:
          break;
      }
    }
  }
  return ts.factory.createExpressionStatement(expr);
} 