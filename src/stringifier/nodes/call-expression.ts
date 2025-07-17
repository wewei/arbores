import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { createSyntaxListNode } from './syntax-list';

// 创建调用表达式节点
export function createCallExpressionNode(node: ASTNode, ast: SourceFileAST): ts.CallExpression {
  const children = node.children || [];
  const expressionNode = children[0] ? ast.nodes[children[0]] : undefined;
  const argsNode = children[1] ? ast.nodes[children[1]] : undefined;

  const expression = expressionNode && expressionNode.text
    ? ts.factory.createIdentifier(expressionNode.text)
    : ts.factory.createIdentifier('func');

  // 处理参数列表，将 NodeArray 转换为 Expression 数组
  const args: ts.Expression[] = [];
  if (argsNode) {
    const nodeArray = createSyntaxListNode(argsNode, ast);
    for (const node of nodeArray) {
      if (ts.isExpression(node)) {
        args.push(node);
      }
    }
  }

  return ts.factory.createCallExpression(expression, undefined, args);
} 