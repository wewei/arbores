import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createThrowStatement: NodeBuilderFn<ts.ThrowStatement> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ThrowStatement => {
    const children = node.children || [];
    
    if (children.length < 2) {
      throw new Error(`ThrowStatement should have at least 2 children (throw + expression), got ${children.length}`);
    }
    
    // ThrowStatement 的结构：[throw 关键字, ...其他tokens..., 表达式]
    // 寻找最后一个非关键字节点作为表达式
    let expressionId: string | undefined;
    
    // 从后往前寻找表达式节点
    for (let i = children.length - 1; i >= 1; i--) {
      const childId = children[i];
      if (childId) {
        const childNode = sourceFile.nodes[childId];
        if (childNode && childNode.kind !== ts.SyntaxKind.ThrowKeyword) {
          expressionId = childId;
          break;
        }
      }
    }
    
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
