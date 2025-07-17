import * as ts from 'typescript';
import type { ASTNode } from '../../types';

// 创建 token 节点
export function createTokenNode(node: ASTNode): ts.Token<ts.SyntaxKind> {
  switch (node.text) {
    case '+':
      return ts.factory.createToken(ts.SyntaxKind.PlusToken);
    case '-':
      return ts.factory.createToken(ts.SyntaxKind.MinusToken);
    case '*':
      return ts.factory.createToken(ts.SyntaxKind.AsteriskToken);
    case '/':
      return ts.factory.createToken(ts.SyntaxKind.SlashToken);
    case '=':
      return ts.factory.createToken(ts.SyntaxKind.EqualsToken);
    case '==':
      return ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken);
    case '===':
      return ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken);
    case '!=':
      return ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken);
    case '!==':
      return ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken);
    case '<':
      return ts.factory.createToken(ts.SyntaxKind.LessThanToken);
    case '<=':
      return ts.factory.createToken(ts.SyntaxKind.LessThanEqualsToken);
    case '>':
      return ts.factory.createToken(ts.SyntaxKind.GreaterThanToken);
    case '>=':
      return ts.factory.createToken(ts.SyntaxKind.GreaterThanEqualsToken);
    case '&&':
      return ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken);
    case '||':
      return ts.factory.createToken(ts.SyntaxKind.BarBarToken);
    case '!':
      return ts.factory.createToken(ts.SyntaxKind.ExclamationToken);
    case '?':
      return ts.factory.createToken(ts.SyntaxKind.QuestionToken);
    case ':':
      return ts.factory.createToken(ts.SyntaxKind.ColonToken);
    case ';':
      return ts.factory.createToken(ts.SyntaxKind.SemicolonToken);
    case ',':
      return ts.factory.createToken(ts.SyntaxKind.CommaToken);
    case '.':
      return ts.factory.createToken(ts.SyntaxKind.DotToken);
    case '(':
      return ts.factory.createToken(ts.SyntaxKind.OpenParenToken);
    case ')':
      return ts.factory.createToken(ts.SyntaxKind.CloseParenToken);
    case '{':
      return ts.factory.createToken(ts.SyntaxKind.OpenBraceToken);
    case '}':
      return ts.factory.createToken(ts.SyntaxKind.CloseBraceToken);
    case '[':
      return ts.factory.createToken(ts.SyntaxKind.OpenBracketToken);
    case ']':
      return ts.factory.createToken(ts.SyntaxKind.CloseBracketToken);
    default:
      return ts.factory.createIdentifier(node.text || 'unknown');
  }
} 