import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 DotDotDotToken 节点
 * Kind: 26
 * 用于展开语法 (...args)
 */
export const createDotDotDotToken: NodeBuilderFn<ts.Token<ts.SyntaxKind.DotDotDotToken>> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.Token<ts.SyntaxKind.DotDotDotToken> => {
    return ts.factory.createToken(ts.SyntaxKind.DotDotDotToken);
  };
};
