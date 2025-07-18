import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { createCallExpressionNode } from './call-expression';

// 创建 await 表达式节点
export function createAwaitExpressionNode(node: ASTNode, ast: SourceFileAST): ts.AwaitExpression {
  const children = node.children || [];
  let expr: ts.Expression = ts.factory.createIdentifier('promise');
  
  // 跳过 AwaitKeyword，查找实际的表达式
  for (const childId of children) {
    const childNode = ast.nodes[childId];
    if (childNode && childNode.kind !== ts.SyntaxKind.AwaitKeyword) {
      switch (childNode.kind) {
        case ts.SyntaxKind.CallExpression:
          expr = createCallExpressionNode(childNode, ast);
          break;
        case ts.SyntaxKind.Identifier:
          expr = ts.factory.createIdentifier(childNode.text || 'promise');
          break;
        // 可以添加更多表达式类型
      }
      break;
    }
  }
  
  return ts.factory.createAwaitExpression(expr);
} 