import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建二元表达式节点
 * 
 * 支持的操作符：
 * - 算术: +, -, *, /, %
 * - 比较: ==, !=, ===, !==, <, <=, >, >=
 * - 逻辑: &&, ||
 * - 位运算: &, |, ^, <<, >>, >>>
 * - 赋值: +=, -=, *=, /=, %=, 等等
 */
export const createBinaryExpression: NodeBuilderFn<ts.BinaryExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.BinaryExpression => {
    const children = node.children || [];
    
    if (children.length !== 3) {
      throw new Error(`BinaryExpression should have exactly 3 children, got ${children.length}`);
    }
    
    // 二元表达式的结构：[左操作数, 操作符, 右操作数]
    const leftNodeId = children[0]!;
    const operatorTokenId = children[1]!;
    const rightNodeId = children[2]!;
    
    // 创建左操作数
    const leftNode = sourceFile.nodes[leftNodeId];
    if (!leftNode) {
      throw new Error(`Left operand node ${leftNodeId} not found`);
    }
    const left = createNode(sourceFile, leftNode) as ts.Expression;
    
    // 获取操作符
    const operatorNode = sourceFile.nodes[operatorTokenId];
    if (!operatorNode) {
      throw new Error(`Operator token ${operatorTokenId} not found`);
    }
    
    // 从 SyntaxKind 获取操作符 token
    const operatorToken = operatorNode.kind as ts.BinaryOperator;
    
    // 创建右操作数
    const rightNode = sourceFile.nodes[rightNodeId];
    if (!rightNode) {
      throw new Error(`Right operand node ${rightNodeId} not found`);
    }
    const right = createNode(sourceFile, rightNode) as ts.Expression;
    
    return ts.factory.createBinaryExpression(
      left,
      operatorToken,
      right
    );
  };
};