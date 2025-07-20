import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createExpressionStatement: NodeBuilderFn<ts.ExpressionStatement> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ExpressionStatement => {
    const children = node.children || [];
    
    if (children.length < 1 || children.length > 2) {
      throw new Error(`ExpressionStatement should have 1 or 2 children, got ${children.length}`);
    }
    
    // 表达式语句的结构：[表达式] 或 [表达式, 分号]
    const expressionNodeId = children[0];
    
    if (!expressionNodeId) {
      throw new Error('ExpressionStatement missing expression child');
    }
    
    // 创建表达式
    const expressionNode = sourceFile.nodes[expressionNodeId];
    if (!expressionNode) {
      throw new Error(`Expression node ${expressionNodeId} not found`);
    }
    
    const expression = createNode(sourceFile, expressionNode) as ts.Expression;
    
    return ts.factory.createExpressionStatement(expression);
  };
};
