import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建数字类型关键字节点
 * 
 * NumberKeyword 用于 TypeScript 的 number 类型注解
 * 
 * 示例: number
 */
export const createNumberKeyword: NodeBuilderFn<ts.KeywordTypeNode> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.KeywordTypeNode => {
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
};
