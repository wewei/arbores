import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createIntersectionType: NodeBuilderFn<ts.IntersectionTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.IntersectionTypeNode => {
    const children = node.children || [];
    
    if (children.length < 3) {
      throw new Error(`IntersectionType should have at least 3 children (type & type), got ${children.length}`);
    }
    
    // IntersectionType 的结构：type & type & type...
    // 提取所有的类型，跳过 & 操作符
    const typeIds: string[] = [];
    
    for (let i = 0; i < children.length; i += 2) {
      // 偶数索引应该是类型，奇数索引应该是 & 操作符
      const childId = children[i];
      if (childId) {
        const childNode = sourceFile.nodes[childId];
        if (childNode && childNode.kind !== ts.SyntaxKind.AmpersandToken) {
          typeIds.push(childId);
        }
      }
    }
    
    if (typeIds.length < 2) {
      throw new Error('IntersectionType should have at least 2 types');
    }
    
    // 创建所有类型
    const types = typeIds
      .map(typeId => {
        const typeNode = sourceFile.nodes[typeId];
        if (typeNode) {
          return createNode(sourceFile, typeNode) as ts.TypeNode;
        }
        return null;
      })
      .filter((type): type is ts.TypeNode => type !== null);
    
    if (types.length < 2) {
      throw new Error('IntersectionType failed to create required types');
    }
    
    return ts.factory.createIntersectionTypeNode(types);
  };
};
