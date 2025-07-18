import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { findChildByKind } from '../utils';

// 创建参数节点
export function createParameterNode(node: ASTNode, ast: SourceFileAST): ts.ParameterDeclaration {
  const children = node.children || [];
  const nameNode = findChildByKind(children, ast, ts.SyntaxKind.Identifier);
  
  // 查找类型节点
  let typeNode: ts.TypeNode | undefined;
  const typeASTNode = findChildByKind(children, ast, ts.SyntaxKind.StringKeyword) ||
                     findChildByKind(children, ast, ts.SyntaxKind.NumberKeyword) ||
                     findChildByKind(children, ast, ts.SyntaxKind.BooleanKeyword) ||
                     findChildByKind(children, ast, ts.SyntaxKind.AnyKeyword) ||
                     findChildByKind(children, ast, ts.SyntaxKind.TypeReference);
  
  if (typeASTNode) {
    switch (typeASTNode.kind) {
      case ts.SyntaxKind.StringKeyword:
        typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
        break;
      case ts.SyntaxKind.NumberKeyword:
        typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
        break;
      case ts.SyntaxKind.BooleanKeyword:
        typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
        break;
      case ts.SyntaxKind.AnyKeyword:
        typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
        break;
      case ts.SyntaxKind.TypeReference:
        // 需要导入 type-reference 节点创建函数
        const { createTypeReferenceNode } = require('./type-reference');
        typeNode = createTypeReferenceNode(typeASTNode, ast);
        break;
    }
  }

  return ts.factory.createParameterDeclaration(
    undefined, // modifiers
    undefined, // dotDotDotToken
    nameNode ? ts.factory.createIdentifier(nameNode.text || '') : ts.factory.createIdentifier('param'),
    undefined, // questionToken
    typeNode,
    undefined // initializer
  );
} 