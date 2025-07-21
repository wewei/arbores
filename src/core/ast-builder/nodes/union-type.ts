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
    
    // 提取所有类型节点，自动处理 SyntaxList 包装器
    const allNodes = extractFromSyntaxList(children, sourceFile);
    
    // 过滤出类型节点，跳过分隔符
    const typeNodes = allNodes.filter(child => !shouldSkipNode(child));
    
    if (typeNodes.length < 2) {
      throw new Error(`UnionType should have at least 2 types, got ${typeNodes.length}`);
    }
    
    const types: ts.TypeNode[] = [];
    for (const typeNode of typeNodes) {
      try {
        const type = createNode(sourceFile, typeNode) as ts.TypeNode;
        types.push(type);
      } catch (error) {
        console.warn(`Failed to create union type member for ${ts.SyntaxKind[typeNode.kind]}:`, error);
      }
    }
    
    if (types.length < 2) {
      throw new Error(`UnionType should have at least 2 valid types after processing`);
    }
    
    return ts.factory.createUnionTypeNode(types);
  };
};
