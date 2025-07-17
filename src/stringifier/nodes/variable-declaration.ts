import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { findChildByKind } from '../utils';

// 创建变量声明节点
export function createVariableDeclarationNode(node: ASTNode, ast: SourceFileAST): ts.VariableDeclaration {
  const children = node.children || [];
  const nameNode = findChildByKind(children, ast, ts.SyntaxKind.Identifier);
  
  return ts.factory.createVariableDeclaration(
    nameNode ? ts.factory.createIdentifier(nameNode.text || '') :
              ts.factory.createIdentifier('var'),
    undefined, // type
    undefined // initializer
  );
} 