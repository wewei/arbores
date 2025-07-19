import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 QualifiedName 节点
 * Kind: 166
 * 例子: Geometry.Point
 */
export const createQualifiedName: NodeBuilderFn<ts.QualifiedName> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.QualifiedName => {
    const children = node.children || [];
    
    if (children.length !== 3) {
      throw new Error(`QualifiedName should have exactly 3 children (left, ., right), got ${children.length}`);
    }
    
    // 结构：[左标识符, ., 右标识符]
    const leftNodeId = children[0]!;
    const rightNodeId = children[2]!; // 跳过点号
    
    const leftNode = sourceFile.nodes[leftNodeId];
    const rightNode = sourceFile.nodes[rightNodeId];
    
    if (!leftNode) {
      throw new Error(`QualifiedName: left node not found: ${leftNodeId}`);
    }
    if (!rightNode) {
      throw new Error(`QualifiedName: right node not found: ${rightNodeId}`);
    }
    
    const left = createNode(sourceFile, leftNode) as ts.EntityName;
    const right = createNode(sourceFile, rightNode) as ts.Identifier;
    
    return ts.factory.createQualifiedName(left, right);
  };
};
