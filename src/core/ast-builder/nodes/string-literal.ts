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

  // node.text 已经包含引号，我们需要保持原始的引号样式
  const originalText = node.text;
  const isSingleQuote = originalText.startsWith("'");
  
  // 移除首尾的引号来获取实际内容
  const content = originalText.slice(1, -1);
  
  // 使用 isSingleQuote 参数来保持原始的引号样式
  return ts.factory.createStringLiteral(content, isSingleQuote);
};
