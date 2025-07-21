import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 ElseKeyword 节点  
 * Kind: 93
 * 例子: else
 */
export const createElseKeyword: NodeBuilderFn<ts.Token<ts.SyntaxKind.ElseKeyword>> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.Token<ts.SyntaxKind.ElseKeyword> => {
    // ElseKeyword 就是 "else" 关键字
    return ts.factory.createToken(ts.SyntaxKind.ElseKeyword);
  };
};
