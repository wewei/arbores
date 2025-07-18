import * as ts from 'typescript';
import type { ASTNode } from '../../types';

// 创建 token 节点
export function createTokenNode(node: ASTNode): ts.Token<ts.SyntaxKind> {
  // 根据节点类型直接创建对应的 Token
  switch (node.kind) {
    case ts.SyntaxKind.PlusToken:
      return ts.factory.createToken(ts.SyntaxKind.PlusToken);
    case ts.SyntaxKind.MinusToken:
      return ts.factory.createToken(ts.SyntaxKind.MinusToken);
    case ts.SyntaxKind.AsteriskToken:
      return ts.factory.createToken(ts.SyntaxKind.AsteriskToken);
    case ts.SyntaxKind.SlashToken:
      return ts.factory.createToken(ts.SyntaxKind.SlashToken);
    case ts.SyntaxKind.EqualsToken:
    case ts.SyntaxKind.FirstAssignment: // 等号赋值
      return ts.factory.createToken(ts.SyntaxKind.EqualsToken);
    case ts.SyntaxKind.SemicolonToken:
      return ts.factory.createToken(ts.SyntaxKind.SemicolonToken);
    case ts.SyntaxKind.CommaToken:
      return ts.factory.createToken(ts.SyntaxKind.CommaToken);
    case ts.SyntaxKind.DotToken:
      return ts.factory.createToken(ts.SyntaxKind.DotToken);
    case ts.SyntaxKind.OpenParenToken:
      return ts.factory.createToken(ts.SyntaxKind.OpenParenToken);
    case ts.SyntaxKind.CloseParenToken:
      return ts.factory.createToken(ts.SyntaxKind.CloseParenToken);
    case ts.SyntaxKind.OpenBraceToken:
    case ts.SyntaxKind.FirstPunctuation: // 左大括号
      return ts.factory.createToken(ts.SyntaxKind.OpenBraceToken);
    case ts.SyntaxKind.CloseBraceToken:
      return ts.factory.createToken(ts.SyntaxKind.CloseBraceToken);
    case ts.SyntaxKind.OpenBracketToken:
      return ts.factory.createToken(ts.SyntaxKind.OpenBracketToken);
    case ts.SyntaxKind.CloseBracketToken:
      return ts.factory.createToken(ts.SyntaxKind.CloseBracketToken);
    case ts.SyntaxKind.ColonToken:
      return ts.factory.createToken(ts.SyntaxKind.ColonToken);
    case ts.SyntaxKind.LessThanToken:
    case ts.SyntaxKind.FirstBinaryOperator: // 小于号
      return ts.factory.createToken(ts.SyntaxKind.LessThanToken);
    case ts.SyntaxKind.GreaterThanToken:
      return ts.factory.createToken(ts.SyntaxKind.GreaterThanToken);
    case ts.SyntaxKind.ConstKeyword:
      return ts.factory.createToken(ts.SyntaxKind.ConstKeyword);
    case ts.SyntaxKind.LetKeyword:
      return ts.factory.createToken(ts.SyntaxKind.LetKeyword);
    case ts.SyntaxKind.VarKeyword:
      return ts.factory.createToken(ts.SyntaxKind.VarKeyword);
    case ts.SyntaxKind.FunctionKeyword:
      return ts.factory.createToken(ts.SyntaxKind.FunctionKeyword);
    case ts.SyntaxKind.ReturnKeyword:
      return ts.factory.createToken(ts.SyntaxKind.ReturnKeyword);
    case ts.SyntaxKind.AwaitKeyword:
      return ts.factory.createToken(ts.SyntaxKind.AwaitKeyword);
    case ts.SyntaxKind.AsyncKeyword:
      return ts.factory.createToken(ts.SyntaxKind.AsyncKeyword);
    default:
      // 根据文本内容创建 Token（向后兼容）
      return createTokenByText(node);
  }
}

// 根据文本内容创建 Token（向后兼容的旧逻辑）
function createTokenByText(node: ASTNode): ts.Token<ts.SyntaxKind> {
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