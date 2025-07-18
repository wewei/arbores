import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建布尔字面量节点
 * 
 * TrueKeyword/FalseKeyword 结构:
 * - text: "true" 或 "false"
 * 
 * 示例: true, false
 */
export const createBooleanLiteral: NodeBuilderFn<ts.BooleanLiteral> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.BooleanLiteral => {
  if (!node.text) {
    throw new Error(`BooleanLiteral requires text property`);
  }

  const value = node.text === 'true';
  return value ? ts.factory.createTrue() : ts.factory.createFalse();
};
