import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 UnknownKeyword 节点
 * Kind: 159
 */
export const createUnknownKeyword: NodeBuilderFn<ts.Token<ts.SyntaxKind.UnknownKeyword>> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.Token<ts.SyntaxKind.UnknownKeyword> => {
    return ts.factory.createToken(ts.SyntaxKind.UnknownKeyword);
  };
};
