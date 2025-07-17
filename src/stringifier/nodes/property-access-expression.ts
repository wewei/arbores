import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';

// 创建属性访问表达式节点
export function createPropertyAccessExpressionNode(node: ASTNode, ast: SourceFileAST): ts.PropertyAccessExpression {
  const children = node.children || [];
  const exprNode = children[0] ? ast.nodes[children[0]] : undefined;
  const nameNode = children[1] ? ast.nodes[children[1]] : undefined;
  const expression = exprNode && exprNode.text ? ts.factory.createIdentifier(exprNode.text) : ts.factory.createIdentifier('obj');
  const name = nameNode && nameNode.text ? ts.factory.createIdentifier(nameNode.text) : ts.factory.createIdentifier('prop');
  return ts.factory.createPropertyAccessExpression(expression, name);
} 