import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 void 类型关键字节点
 * 
 * VoidKeyword 用于 TypeScript 的 void 类型注解，通常用于函数返回类型
 * 
 * 示例: void
 */
export const createVoidKeyword: NodeBuilderFn<ts.KeywordTypeNode> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.KeywordTypeNode => {
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
};
