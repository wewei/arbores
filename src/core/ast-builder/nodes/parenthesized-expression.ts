import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 ParenthesizedExpression 节点
 * Kind: 217
 * 例子: (expression)
 */
export const createParenthesizedExpression: NodeBuilderFn<ts.ParenthesizedExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ParenthesizedExpression => {
    const children = node.children || [];
    
    if (children.length !== 3) {
      throw new Error(`ParenthesizedExpression should have exactly 3 children (openParen, expression, closeParen), got ${children.length}`);
    }
    
    // 结构：[(, expression, )]
    const expressionNodeId = children[1]!; // 跳过 (
    const expressionNode = sourceFile.nodes[expressionNodeId];
    
    if (!expressionNode) {
      throw new Error(`ParenthesizedExpression: expression node not found: ${expressionNodeId}`);
    }
    
    const expression = createNode(sourceFile, expressionNode) as ts.Expression;
    
    return ts.factory.createParenthesizedExpression(expression);
  };
};
