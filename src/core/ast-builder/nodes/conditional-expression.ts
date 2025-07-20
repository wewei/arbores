import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createConditionalExpression: NodeBuilderFn<ts.ConditionalExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ConditionalExpression => {
    const children = node.children || [];
    
    if (children.length !== 5) {
      throw new Error(`ConditionalExpression should have exactly 5 children (condition, ?, whenTrue, :, whenFalse), got ${children.length}`);
    }
    
    // 三元表达式的结构：[条件, ?, 真值表达式, :, 假值表达式]
    const conditionNodeId = children[0];
    const questionTokenId = children[1];
    const whenTrueNodeId = children[2]; 
    const colonTokenId = children[3];
    const whenFalseNodeId = children[4];
    
    if (!conditionNodeId || !whenTrueNodeId || !whenFalseNodeId) {
      throw new Error('ConditionalExpression missing required expression children');
    }
    
    // 创建条件表达式
    const conditionNode = sourceFile.nodes[conditionNodeId];
    if (!conditionNode) {
      throw new Error(`Condition node ${conditionNodeId} not found`);
    }
    const condition = createNode(sourceFile, conditionNode) as ts.Expression;
    
    // 创建真值表达式
    const whenTrueNode = sourceFile.nodes[whenTrueNodeId];
    if (!whenTrueNode) {
      throw new Error(`WhenTrue node ${whenTrueNodeId} not found`);
    }
    const whenTrue = createNode(sourceFile, whenTrueNode) as ts.Expression;
    
    // 创建假值表达式
    const whenFalseNode = sourceFile.nodes[whenFalseNodeId];
    if (!whenFalseNode) {
      throw new Error(`WhenFalse node ${whenFalseNodeId} not found`);
    }
    const whenFalse = createNode(sourceFile, whenFalseNode) as ts.Expression;
    
    return ts.factory.createConditionalExpression(condition, ts.factory.createToken(ts.SyntaxKind.QuestionToken), whenTrue, ts.factory.createToken(ts.SyntaxKind.ColonToken), whenFalse);
  };
};
