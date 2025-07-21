import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 ParenthesizedType 节点
 * Kind: 196
 * 例子: (string | number)
 */
export const createParenthesizedType: NodeBuilderFn<ts.ParenthesizedTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ParenthesizedTypeNode => {
    const children = node.children || [];
    
    if (children.length !== 3) {
      throw new Error(`ParenthesizedType should have exactly 3 children (openParen, type, closeParen), got ${children.length}`);
    }
    
    // 结构：[OpenParenToken, TypeNode, CloseParenToken]
    const typeNodeId = children[1]!; // 中间是实际的类型
    const typeNode = sourceFile.nodes[typeNodeId];
    
    if (!typeNode) {
      throw new Error(`ParenthesizedType: type node not found: ${typeNodeId}`);
    }
    
    // 验证第一和第三个子节点是正确的tokens
    const openParenNode = sourceFile.nodes[children[0]!];
    const closeParenNode = sourceFile.nodes[children[2]!];
    
    if (!openParenNode || openParenNode.kind !== ts.SyntaxKind.OpenParenToken) {
      console.warn('ParenthesizedType: expected OpenParenToken as first child');
    }
    if (!closeParenNode || closeParenNode.kind !== ts.SyntaxKind.CloseParenToken) {
      console.warn('ParenthesizedType: expected CloseParenToken as third child');
    }
    
    const type = createNode(sourceFile, typeNode) as ts.TypeNode;
    
    return ts.factory.createParenthesizedType(type);
  };
};
