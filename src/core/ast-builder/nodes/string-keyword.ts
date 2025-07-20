import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建字符串类型关键字节点
 * 
 * StringKeyword 用于 TypeScript 的 string 类型注解
 * 
 * 示例: string
 */
export const createStringKeyword: NodeBuilderFn<ts.KeywordTypeNode> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.KeywordTypeNode => {
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
};
