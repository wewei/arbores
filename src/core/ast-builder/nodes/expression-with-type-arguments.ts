import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 ExpressionWithTypeArguments 节点
 * Kind: 233
 * 例子: BaseClass<T>, IInterface
 */
export const createExpressionWithTypeArguments: NodeBuilderFn<ts.ExpressionWithTypeArguments> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ExpressionWithTypeArguments => {
    const children = node.children || [];
    
    if (children.length < 1) {
      throw new Error('ExpressionWithTypeArguments should have at least 1 child (expression)');
    }
    
    // 第一个子节点是表达式（通常是标识符）
    const expressionNodeId = children[0]!;
    const expressionNode = sourceFile.nodes[expressionNodeId];
    
    if (!expressionNode) {
      throw new Error(`ExpressionWithTypeArguments: expression node not found: ${expressionNodeId}`);
    }
    
    const expression = createNode(sourceFile, expressionNode) as ts.LeftHandSideExpression;
    
    // 查找类型参数（如果有的话）
    let typeArguments: ts.TypeNode[] | undefined;
    
    // 简单实现：如果有更多子节点，尝试收集类型参数
    if (children.length > 1) {
      typeArguments = [];
      for (let i = 1; i < children.length; i++) {
        const childId = children[i];
        const childNode = sourceFile.nodes[childId!];
        if (childNode && childNode.kind !== ts.SyntaxKind.LessThanToken && 
            childNode.kind !== ts.SyntaxKind.GreaterThanToken &&
            childNode.kind !== ts.SyntaxKind.CommaToken) {
          typeArguments.push(createNode(sourceFile, childNode) as ts.TypeNode);
        }
      }
      if (typeArguments.length === 0) {
        typeArguments = undefined;
      }
    }
    
    return ts.factory.createExpressionWithTypeArguments(expression, typeArguments);
  };
};
