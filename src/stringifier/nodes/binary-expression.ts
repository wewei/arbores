import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { createTokenNode } from './token';

// 创建二元表达式节点
export function createBinaryExpressionNode(node: ASTNode, ast: SourceFileAST): ts.BinaryExpression {
  const children = node.children || [];
  const leftNode = children[0] ? ast.nodes[children[0]] : undefined;
  const operatorNode = children[1] ? ast.nodes[children[1]] : undefined;
  const rightNode = children[2] ? ast.nodes[children[2]] : undefined;

  // 递归处理左右表达式
  const left = leftNode
    ? (leftNode.kind === ts.SyntaxKind.BinaryExpression
        ? createBinaryExpressionNode(leftNode, ast)
        : leftNode.text
          ? ts.factory.createIdentifier(leftNode.text)
          : ts.factory.createIdentifier('left'))
    : ts.factory.createIdentifier('left');

  const right = rightNode
    ? (rightNode.kind === ts.SyntaxKind.BinaryExpression
        ? createBinaryExpressionNode(rightNode, ast)
        : rightNode.text
          ? ts.factory.createIdentifier(rightNode.text)
          : ts.factory.createIdentifier('right'))
    : ts.factory.createIdentifier('right');

  // 处理操作符
  let operator: ts.BinaryOperatorToken;
  if (operatorNode && operatorNode.text) {
    switch (operatorNode.text) {
      case '+':
        operator = ts.factory.createToken(ts.SyntaxKind.PlusToken) as ts.BinaryOperatorToken;
        break;
      case '-':
        operator = ts.factory.createToken(ts.SyntaxKind.MinusToken) as ts.BinaryOperatorToken;
        break;
      case '*':
        operator = ts.factory.createToken(ts.SyntaxKind.AsteriskToken) as ts.BinaryOperatorToken;
        break;
      case '/':
        operator = ts.factory.createToken(ts.SyntaxKind.SlashToken) as ts.BinaryOperatorToken;
        break;
      case '==':
        operator = ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken) as ts.BinaryOperatorToken;
        break;
      case '===':
        operator = ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken) as ts.BinaryOperatorToken;
        break;
      case '!=':
        operator = ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken) as ts.BinaryOperatorToken;
        break;
      case '!==':
        operator = ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken) as ts.BinaryOperatorToken;
        break;
      case '<':
        operator = ts.factory.createToken(ts.SyntaxKind.LessThanToken) as ts.BinaryOperatorToken;
        break;
      case '<=':
        operator = ts.factory.createToken(ts.SyntaxKind.LessThanEqualsToken) as ts.BinaryOperatorToken;
        break;
      case '>':
        operator = ts.factory.createToken(ts.SyntaxKind.GreaterThanToken) as ts.BinaryOperatorToken;
        break;
      case '>=':
        operator = ts.factory.createToken(ts.SyntaxKind.GreaterThanEqualsToken) as ts.BinaryOperatorToken;
        break;
      case '&&':
        operator = ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken) as ts.BinaryOperatorToken;
        break;
      case '||':
        operator = ts.factory.createToken(ts.SyntaxKind.BarBarToken) as ts.BinaryOperatorToken;
        break;
      default:
        operator = ts.factory.createToken(ts.SyntaxKind.PlusToken) as ts.BinaryOperatorToken;
    }
  } else {
    operator = ts.factory.createToken(ts.SyntaxKind.PlusToken) as ts.BinaryOperatorToken;
  }

  return ts.factory.createBinaryExpression(left, operator, right);
} 