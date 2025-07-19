import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建布尔类型关键字节点
 * 
 * BooleanKeyword 用于 TypeScript 的 boolean 类型注解
 * 
 * 示例: boolean
 */
export const createBooleanKeyword: NodeBuilderFn<ts.KeywordTypeNode> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.KeywordTypeNode => {
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
};
