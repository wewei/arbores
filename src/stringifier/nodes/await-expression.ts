import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { createCallExpressionNode } from './call-expression';

// 创建 await 表达式节点
export function createAwaitExpressionNode(node: ASTNode, ast: SourceFileAST): ts.AwaitExpression {
  const children = node.children || [];
  const exprNode = children[0] ? ast.nodes[children[0]] : undefined;
  let expr: ts.Expression = ts.factory.createIdentifier('promise');
  if (exprNode) {
    if (exprNode.kind === ts.SyntaxKind.CallExpression) {
      expr = createCallExpressionNode(exprNode, ast);
    } else if (exprNode.text) {
      expr = ts.factory.createIdentifier(exprNode.text);
    }
  }
  return ts.factory.createAwaitExpression(expr);
} 