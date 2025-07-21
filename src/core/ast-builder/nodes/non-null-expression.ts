import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createNonNullExpression: NodeBuilderFn<ts.NonNullExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.NonNullExpression => {
    const children = node.children || [];
    
    if (children.length !== 2) {
      throw new Error(`NonNullExpression should have exactly 2 children (expression + !), got ${children.length}`);
    }
    
    // NonNullExpression 的结构：[表达式, '!' 操作符]
    const expressionId = children[0];
    const exclamationTokenId = children[1]; // '!' token
    
    if (!expressionId) {
      throw new Error('NonNullExpression missing expression child');
    }
    
    // 创建被断言的表达式
    const expressionNode = sourceFile.nodes[expressionId];
    if (!expressionNode) {
      throw new Error(`Expression node ${expressionId} not found`);
    }
    
    const expression = createNode(sourceFile, expressionNode) as ts.Expression;
    
    return ts.factory.createNonNullExpression(expression);
  };
};
