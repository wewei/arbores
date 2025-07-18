import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
 
// 创建对象字面量表达式节点
export function createObjectLiteralExpressionNode(node: ASTNode, ast: SourceFileAST): ts.ObjectLiteralExpression {
  return ts.factory.createObjectLiteralExpression([], false);
} 