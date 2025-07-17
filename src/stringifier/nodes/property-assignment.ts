import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { findChildByKind } from '../utils';

// 创建属性赋值节点
export function createPropertyAssignmentNode(node: ASTNode, ast: SourceFileAST): ts.PropertyAssignment {
  const children = node.children || [];
  const nameNode = findChildByKind(children, ast, ts.SyntaxKind.Identifier);
  
  return ts.factory.createPropertyAssignment(
    nameNode ? ts.factory.createIdentifier(nameNode.text || '') :
              ts.factory.createIdentifier('prop'),
    ts.factory.createStringLiteral('value')
  );
} 