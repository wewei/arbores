import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { findChildByKind } from '../utils';

// 创建接口声明节点
export function createInterfaceDeclarationNode(node: ASTNode, ast: SourceFileAST): ts.InterfaceDeclaration {
  const children = node.children || [];
  const nameNode = findChildByKind(children, ast, ts.SyntaxKind.Identifier);
  
  return ts.factory.createInterfaceDeclaration(
    undefined, // modifiers
    nameNode ? ts.factory.createIdentifier(nameNode.text || '') : 
              ts.factory.createIdentifier('AnonymousInterface'),
    undefined, // typeParameters
    undefined, // heritageClauses
    [] // TODO: 实现接口成员解析
  );
} 