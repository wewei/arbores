import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 await 表达式节点
 * 
 * AwaitExpression 结构:
 * - children[0]: await 关键字 (SyntaxKind.AwaitKeyword)
 * - children[1]: 要等待的表达式
 * 
 * 示例: await fetch('/api/data')
 */
export const createAwaitExpression: NodeBuilderFn<ts.AwaitExpression> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.AwaitExpression => {
  const children = node.children || [];
  
  if (children.length < 2) {
    throw new Error(`AwaitExpression requires at least 2 children (await keyword + expression), got ${children.length}`);
  }

  // children[0] 是 await 关键字，我们跳过它
  // children[1] 是要等待的表达式
  const awaitedExpressionNode = sourceFile.nodes[children[1]!];
  if (!awaitedExpressionNode) {
    throw new Error(`Cannot find awaited expression node with id: ${children[1]}`);
  }
  
  const awaitedExpression = createNode(sourceFile, awaitedExpressionNode);

  return ts.factory.createAwaitExpression(awaitedExpression);
};
