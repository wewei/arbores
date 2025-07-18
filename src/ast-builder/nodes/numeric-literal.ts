import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建数字字面量节点
 * 
 * NumericLiteral 结构:
 * - text: 数字值的字符串表示
 * 
 * 示例: 1, 2, 10, 3.14
 */
export const createNumericLiteral: NodeBuilderFn<ts.NumericLiteral> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.NumericLiteral => {
  if (!node.text) {
    throw new Error(`NumericLiteral requires text property`);
  }

  return ts.factory.createNumericLiteral(node.text);
};
