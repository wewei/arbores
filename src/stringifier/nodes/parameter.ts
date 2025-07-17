import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { findChildByKind } from '../utils';

// 创建参数节点
export function createParameterNode(node: ASTNode, ast: SourceFileAST): ts.ParameterDeclaration {
  const children = node.children || [];
  const nameNode = findChildByKind(children, ast, ts.SyntaxKind.Identifier);
  const typeNode = findChildByKind(children, ast, ts.SyntaxKind.NumberKeyword) || findChildByKind(children, ast, ts.SyntaxKind.StringKeyword) || findChildByKind(children, ast, ts.SyntaxKind.TypeReference);

  return ts.factory.createParameterDeclaration(
    undefined, // modifiers
    undefined, // dotDotDotToken
    nameNode ? ts.factory.createIdentifier(nameNode.text || '') : ts.factory.createIdentifier('param'),
    undefined, // questionToken
    typeNode ? (typeNode.text ? ts.factory.createKeywordTypeNode((typeNode.kind as ts.KeywordTypeSyntaxKind)) : ts.factory.createTypeReferenceNode(typeNode.text || 'any', undefined)) : undefined,
    undefined // initializer
  );
} 