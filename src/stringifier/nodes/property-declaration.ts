import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { getModifiers, findChildByKind } from '../utils';

// 创建属性声明节点
export function createPropertyDeclarationNode(node: ASTNode, ast: SourceFileAST): ts.PropertyDeclaration {
  const children = node.children || [];
  const modifiers = getModifiers(children, ast);
  const nameNode = findChildByKind(children, ast, ts.SyntaxKind.Identifier);
  
  return ts.factory.createPropertyDeclaration(
    modifiers,
    nameNode ? ts.factory.createIdentifier(nameNode.text || '') :
              ts.factory.createIdentifier('prop'),
    undefined, // questionToken
    undefined, // type
    undefined // initializer
  );
} 