import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建Token节点
 */
export const createToken: NodeBuilderFn<ts.Node> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.Node => {
    // 根据不同的token类型创建相应的节点
    switch (node.kind) {
      case ts.SyntaxKind.OpenParenToken:
      case ts.SyntaxKind.CloseParenToken:
      case ts.SyntaxKind.OpenBraceToken:
      case ts.SyntaxKind.CloseBraceToken:
      case ts.SyntaxKind.SemicolonToken:
      case ts.SyntaxKind.CommaToken:
      case ts.SyntaxKind.DotToken:
      case ts.SyntaxKind.ColonToken:
      case ts.SyntaxKind.EqualsToken:
      case ts.SyntaxKind.PlusToken:
      case ts.SyntaxKind.MinusToken:
      case ts.SyntaxKind.AsteriskToken:
      case ts.SyntaxKind.SlashToken:
      case ts.SyntaxKind.QuestionToken:
        return ts.factory.createToken(node.kind as ts.PunctuationSyntaxKind);
      
      default:
        // 对于其他类型，尝试创建标识符
        return ts.factory.createIdentifier(`/* Token: ${ts.SyntaxKind[node.kind]} */`);
    }
  };
};
