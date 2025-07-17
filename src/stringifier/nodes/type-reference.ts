import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { findChildByKind } from '../utils';

// 创建类型引用节点
export function createTypeReferenceNode(node: ASTNode, ast: SourceFileAST): ts.TypeReferenceNode {
  const children = node.children || [];
  const typeNameNode = findChildByKind(children, ast, ts.SyntaxKind.Identifier);
  
  return ts.factory.createTypeReferenceNode(
    typeNameNode ? ts.factory.createIdentifier(typeNameNode.text || '') :
                  ts.factory.createIdentifier('any'),
    undefined // typeArguments
  );
} 