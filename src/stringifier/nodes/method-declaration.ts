import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { getModifiers, findChildByKind } from '../utils';

// 创建方法声明节点
export function createMethodDeclarationNode(node: ASTNode, ast: SourceFileAST): ts.MethodDeclaration {
  const children = node.children || [];
  const modifiers = getModifiers(children, ast);
  const nameNode = findChildByKind(children, ast, ts.SyntaxKind.Identifier);
  
  return ts.factory.createMethodDeclaration(
    modifiers,
    undefined, // asteriskToken
    nameNode ? ts.factory.createIdentifier(nameNode.text || '') :
              ts.factory.createIdentifier('method'),
    undefined, // questionToken
    undefined, // typeParameters
    [], // TODO: 实现参数解析
    undefined, // type
    undefined // TODO: 实现方法体解析
  );
} 