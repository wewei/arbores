import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createLiteralType: NodeBuilderFn<ts.LiteralTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.LiteralTypeNode => {
    const children = node.children || [];
    
    if (children.length !== 1) {
      throw new Error(`LiteralType should have exactly 1 child (literal), got ${children.length}`);
    }
    
    // LiteralType包含一个字面量
    const literalId = children[0];
    
    if (!literalId) {
      throw new Error('LiteralType missing literal child');
    }
    
    const literalNode = sourceFile.nodes[literalId];
    if (!literalNode) {
      throw new Error(`Literal node ${literalId} not found`);
    }
    
    // 创建字面量表达式
    const literal = createNode(sourceFile, literalNode) as ts.LiteralExpression | ts.NullLiteral | ts.BooleanLiteral | ts.PrefixUnaryExpression;
    
    return ts.factory.createLiteralTypeNode(literal);
  };
};
