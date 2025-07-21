import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 ArrayType 节点
 * Kind: 188
 * 例子: T[] 或 string[]
 */
export const createArrayType: NodeBuilderFn<ts.ArrayTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ArrayTypeNode => {
    const children = node.children || [];
    
    if (children.length !== 3) {
      throw new Error(`ArrayType should have exactly 3 children (elementType, [, ]), got ${children.length}`);
    }
    
    // 结构：[元素类型, OpenBracketToken, CloseBracketToken]
    const elementTypeNodeId = children[0]!;
    const elementTypeNode = sourceFile.nodes[elementTypeNodeId];
    
    if (!elementTypeNode) {
      throw new Error(`ArrayType: element type node not found: ${elementTypeNodeId}`);
    }
    
    // 验证第二和第三个子节点是正确的tokens
    const openBracketNode = sourceFile.nodes[children[1]!];
    const closeBracketNode = sourceFile.nodes[children[2]!];
    
    if (!openBracketNode || openBracketNode.kind !== ts.SyntaxKind.OpenBracketToken) {
      console.warn('ArrayType: expected OpenBracketToken as second child');
    }
    if (!closeBracketNode || closeBracketNode.kind !== ts.SyntaxKind.CloseBracketToken) {
      console.warn('ArrayType: expected CloseBracketToken as third child');
    }
    
    const elementType = createNode(sourceFile, elementTypeNode) as ts.TypeNode;
    
    return ts.factory.createArrayTypeNode(elementType);
  };
};
