import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 TypeOfExpression 节点
 * Kind: 221
 * 例子: typeof value
 */
export const createTypeOfExpression: NodeBuilderFn<ts.TypeOfExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TypeOfExpression => {
    const children = node.children || [];
    
    if (children.length !== 2) {
      throw new Error(`TypeOfExpression should have exactly 2 children (typeof keyword + expression), got ${children.length}`);
    }
    
    // 结构：[typeof 关键字, 表达式]
    const expressionNodeId = children[1]!;
    const expressionNode = sourceFile.nodes[expressionNodeId];
    
    if (!expressionNode) {
      throw new Error(`Expression node not found: ${expressionNodeId}`);
    }
    
    // 创建表达式节点
    const expression = createNode(sourceFile, expressionNode) as ts.Expression;
    
    return ts.factory.createTypeOfExpression(expression);
  };
};
