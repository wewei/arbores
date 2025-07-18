import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建字符串字面量节点
 * 
 * StringLiteral 结构:
 * - text: 字符串值（包括引号）
 * 
 * 示例: "hello", 'world', `template`
 */
export const createStringLiteral: NodeBuilderFn<ts.StringLiteral> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.StringLiteral => {
  if (!node.text) {
    throw new Error(`StringLiteral requires text property`);
  }

  // node.text 已经包含引号，所以我们需要移除引号来获取实际内容
  const content = node.text.slice(1, -1); // 移除首尾的引号
  return ts.factory.createStringLiteral(content);
};
