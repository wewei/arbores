import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';

// 创建数组字面量表达式节点
export function createArrayLiteralExpressionNode(node: ASTNode, ast: SourceFileAST): ts.ArrayLiteralExpression {
  return ts.factory.createArrayLiteralExpression([], false);
} 