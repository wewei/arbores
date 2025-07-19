import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 UndefinedKeyword 节点
 * Kind: 157
 */
export const createUndefinedKeyword: NodeBuilderFn<ts.Token<ts.SyntaxKind.UndefinedKeyword>> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.Token<ts.SyntaxKind.UndefinedKeyword> => {
    return ts.factory.createToken(ts.SyntaxKind.UndefinedKeyword);
  };
};
