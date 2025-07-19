import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 IndexedAccessType 节点
 * Kind: 199
 * 例子: Person['name'] 或 T[K]
 */
export const createIndexedAccessType: NodeBuilderFn<ts.IndexedAccessTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.IndexedAccessTypeNode => {
    const children = node.children || [];
    
    if (children.length !== 4) {
      throw new Error(`IndexedAccessType should have exactly 4 children (objectType, [, indexType, ]), got ${children.length}`);
    }
    
    // 结构：[对象类型, [, 索引类型, ]]
    const objectTypeNodeId = children[0]!;
    const indexTypeNodeId = children[2]!; // 跳过 [
    
    const objectTypeNode = sourceFile.nodes[objectTypeNodeId];
    const indexTypeNode = sourceFile.nodes[indexTypeNodeId];
    
    if (!objectTypeNode) {
      throw new Error(`IndexedAccessType: object type node not found: ${objectTypeNodeId}`);
    }
    if (!indexTypeNode) {
      throw new Error(`IndexedAccessType: index type node not found: ${indexTypeNodeId}`);
    }
    
    const objectType = createNode(sourceFile, objectTypeNode) as ts.TypeNode;
    const indexType = createNode(sourceFile, indexTypeNode) as ts.TypeNode;
    
    return ts.factory.createIndexedAccessTypeNode(objectType, indexType);
  };
};
