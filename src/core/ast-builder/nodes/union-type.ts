import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createUnionType: NodeBuilderFn<ts.UnionTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.UnionTypeNode => {
    const children = node.children || [];
    
    if (children.length < 1) {
      throw new Error(`UnionType should have at least 1 child (syntax list), got ${children.length}`);
    }
    
    // UnionType包含一个SyntaxList，其中包含多个类型，由|分隔
    const syntaxListId = children[0];
    
    if (!syntaxListId) {
      throw new Error('UnionType missing syntax list child');
    }
    
    const syntaxListNode = sourceFile.nodes[syntaxListId];
    if (!syntaxListNode || !syntaxListNode.children) {
      throw new Error('UnionType syntax list not found or has no children');
    }
    
    const types: ts.TypeNode[] = [];
    
    for (const childId of syntaxListNode.children) {
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      // 跳过分隔符token（|）
      if (childNode.kind === ts.SyntaxKind.BarToken) {
        continue;
      }
      
      // 创建类型节点
      const type = createNode(sourceFile, childNode) as ts.TypeNode;
      types.push(type);
    }
    
    if (types.length < 2) {
      throw new Error(`UnionType should have at least 2 types, got ${types.length}`);
    }
    
    return ts.factory.createUnionTypeNode(types);
  };
};
