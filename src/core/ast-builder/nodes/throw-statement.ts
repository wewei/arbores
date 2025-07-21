import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createThrowStatement: NodeBuilderFn<ts.ThrowStatement> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ThrowStatement => {
    const children = node.children || [];
    
    if (children.length < 2) {
      throw new Error(`ThrowStatement should have at least 2 children (throw + expression), got ${children.length}`);
    }
    
    // ThrowStatement 的结构：[throw 关键字, 表达式]
    // 第二个子节点应该是表达式
    const expressionId = children[1];
    
    if (!expressionId) {
      throw new Error('ThrowStatement missing expression child');
    }
    
    // 创建要抛出的表达式
    const expressionNode = sourceFile.nodes[expressionId];
    if (!expressionNode) {
      throw new Error(`Expression node ${expressionId} not found`);
    }
    
    const expression = createNode(sourceFile, expressionNode) as ts.Expression;
    
    return ts.factory.createThrowStatement(expression);
  };
};
