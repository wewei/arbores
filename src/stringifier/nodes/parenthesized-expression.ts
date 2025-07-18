import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
 
// 创建括号表达式节点
export function createParenthesizedExpressionNode(node: ASTNode, ast: SourceFileAST): ts.ParenthesizedExpression {
  return ts.factory.createParenthesizedExpression(ts.factory.createIdentifier('expr'));
} 