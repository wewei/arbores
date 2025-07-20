import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 NeverKeyword 节点
 * Kind: 146
 */
export const createNeverKeyword: NodeBuilderFn<ts.Token<ts.SyntaxKind.NeverKeyword>> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.Token<ts.SyntaxKind.NeverKeyword> => {
    return ts.factory.createToken(ts.SyntaxKind.NeverKeyword);
  };
};
