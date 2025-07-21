import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { extractFromSyntaxList, shouldSkipNode } from '../utils';

export const createUnionType: NodeBuilderFn<ts.UnionTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.UnionTypeNode => {
    const children = node.children || [];
    
    if (children.length < 1) {
      throw new Error(`UnionType should have at least 1 child, got ${children.length}`);
    }
    
    // 查找 SyntaxList 中的类型节点
    const types: ts.TypeNode[] = [];
    
    for (const childId of children) {
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      if (childNode.kind === ts.SyntaxKind.SyntaxList) {
        // 处理 SyntaxList 中的类型节点
        const syntaxListChildren = childNode.children || [];
        for (const typeId of syntaxListChildren) {
          const typeNode = sourceFile.nodes[typeId];
          if (!typeNode) continue;
          
          // 跳过管道符号和其他分隔符
          if (shouldSkipNode(typeNode)) continue;
          
          try {
            const type = createNode(sourceFile, typeNode) as ts.TypeNode;
            types.push(type);
          } catch (error) {
            console.warn(`Failed to create union type member for ${ts.SyntaxKind[typeNode.kind]}:`, error);
          }
        }
      } else if (!shouldSkipNode(childNode)) {
        // 直接处理类型节点（非 SyntaxList）
        try {
          const type = createNode(sourceFile, childNode) as ts.TypeNode;
          types.push(type);
        } catch (error) {
          console.warn(`Failed to create union type member for ${ts.SyntaxKind[childNode.kind]}:`, error);
        }
      }
    }
    
    if (types.length < 2) {
      throw new Error(`UnionType should have at least 2 valid types after processing, got ${types.length}`);
    }
    
    return ts.factory.createUnionTypeNode(types);
  };
};
