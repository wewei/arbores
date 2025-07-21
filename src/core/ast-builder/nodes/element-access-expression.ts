import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createElementAccessExpression: NodeBuilderFn<ts.ElementAccessExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ElementAccessExpression => {
    const children = node.children || [];
    
    if (children.length < 4) {
      throw new Error(`ElementAccessExpression should have at least 4 children (expression + [ + argumentExpression + ]), got ${children.length}`);
    }
    
    // ElementAccessExpression 的结构：[表达式, '[', 参数表达式, ']']
    const expressionId = children[0];
    const openBracketId = children[1]; // '['
    const argumentExpressionId = children[2];
    const closeBracketId = children[3]; // ']'
    
    if (!expressionId || !argumentExpressionId) {
      throw new Error('ElementAccessExpression missing required children');
    }
    
    // 创建主表达式 (被访问的对象/数组)
    const expressionNode = sourceFile.nodes[expressionId];
    if (!expressionNode) {
      throw new Error(`Expression node ${expressionId} not found`);
    }
    
    const expression = createNode(sourceFile, expressionNode) as ts.Expression;
    
    // 创建参数表达式 (索引/键)
    const argumentExpressionNode = sourceFile.nodes[argumentExpressionId];
    if (!argumentExpressionNode) {
      throw new Error(`Argument expression node ${argumentExpressionId} not found`);
    }
    
    const argumentExpression = createNode(sourceFile, argumentExpressionNode) as ts.Expression;
    
    return ts.factory.createElementAccessExpression(expression, argumentExpression);
  };
};
