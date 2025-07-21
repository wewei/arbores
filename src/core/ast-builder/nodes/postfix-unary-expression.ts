import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createPostfixUnaryExpression: NodeBuilderFn<ts.PostfixUnaryExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.PostfixUnaryExpression => {
    const children = node.children || [];
    
    if (children.length !== 2) {
      throw new Error(`PostfixUnaryExpression should have exactly 2 children, got ${children.length}`);
    }
    
    // 后缀一元表达式的结构：[操作数, 操作符]
    const operandNodeId = children[0];
    const operatorTokenId = children[1];
    
    if (!operandNodeId || !operatorTokenId) {
      throw new Error('PostfixUnaryExpression missing required children');
    }
    
    // 创建操作数
    const operandNode = sourceFile.nodes[operandNodeId];
    if (!operandNode) {
      throw new Error(`Operand node ${operandNodeId} not found`);
    }
    
    const operand = createNode(sourceFile, operandNode) as ts.Expression;
    
    // 获取操作符token
    const operatorToken = sourceFile.nodes[operatorTokenId];
    if (!operatorToken) {
      throw new Error(`Operator token ${operatorTokenId} not found`);
    }
    
    // 根据操作符的kind来确定操作类型
    const operator = operatorToken.kind as ts.PostfixUnaryOperator;
    
    return ts.factory.createPostfixUnaryExpression(operand, operator);
  };
};
