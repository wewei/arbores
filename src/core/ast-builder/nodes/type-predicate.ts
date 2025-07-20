import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 TypePredicate 节点
 * Kind: 182
 * 例子: value is string
 */
export const createTypePredicate: NodeBuilderFn<ts.TypePredicateNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TypePredicateNode => {
    const children = node.children || [];
    
    if (children.length !== 3) {
      throw new Error(`TypePredicate should have exactly 3 children (parameterName, is, type), got ${children.length}`);
    }
    
    // 结构：[parameterName, is, type]
    const parameterNameNodeId = children[0]!;
    const typeNodeId = children[2]!;
    
    const parameterNameNode = sourceFile.nodes[parameterNameNodeId];
    const typeNode = sourceFile.nodes[typeNodeId];
    
    if (!parameterNameNode) {
      throw new Error(`TypePredicate: parameter name node not found: ${parameterNameNodeId}`);
    }
    if (!typeNode) {
      throw new Error(`TypePredicate: type node not found: ${typeNodeId}`);
    }
    
    const parameterName = createNode(sourceFile, parameterNameNode) as ts.Identifier;
    const type = createNode(sourceFile, typeNode) as ts.TypeNode;
    
    return ts.factory.createTypePredicateNode(
      undefined, // assertsModifier
      parameterName,
      type
    );
  };
};
