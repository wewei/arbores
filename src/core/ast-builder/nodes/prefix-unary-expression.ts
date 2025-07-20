import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createPrefixUnaryExpression: NodeBuilderFn<ts.PrefixUnaryExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.PrefixUnaryExpression => {
    const children = node.children || [];
    
    if (children.length !== 2) {
      throw new Error(`PrefixUnaryExpression should have exactly 2 children, got ${children.length}`);
    }
    
    // 前缀一元表达式的结构：[操作符, 操作数]
    const operatorTokenId = children[0];
    const operandNodeId = children[1];
    
    if (!operatorTokenId || !operandNodeId) {
      throw new Error('PrefixUnaryExpression missing required children');
    }
    
    // 获取操作符token
    const operatorToken = sourceFile.nodes[operatorTokenId];
    if (!operatorToken) {
      throw new Error(`Operator token ${operatorTokenId} not found`);
    }
    
    // 创建操作数
    const operandNode = sourceFile.nodes[operandNodeId];
    if (!operandNode) {
      throw new Error(`Operand node ${operandNodeId} not found`);
    }
    
    const operand = createNode(sourceFile, operandNode) as ts.Expression;
    
    // 根据操作符的kind来确定操作类型
    const operator = operatorToken.kind as ts.PrefixUnaryOperator;
    
    return ts.factory.createPrefixUnaryExpression(operator, operand);
  };
};
