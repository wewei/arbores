import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 any 类型关键字节点
 * 
 * AnyKeyword 用于 TypeScript 的 any 类型注解
 * 
 * 示例: any
 */
export const createAnyKeyword: NodeBuilderFn<ts.KeywordTypeNode> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.KeywordTypeNode => {
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
};
