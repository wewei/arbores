import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { getModifiers, findChildByKind } from '../utils';

// 创建变量语句节点
export function createVariableStatementNode(node: ASTNode, ast: SourceFileAST): ts.VariableStatement {
  const children = node.children || [];
  const modifiers = getModifiers(children, ast);
  const declarationList = findChildByKind(children, ast, ts.SyntaxKind.VariableDeclarationList);
  
  return ts.factory.createVariableStatement(
    modifiers,
    declarationList ? ts.factory.createVariableDeclarationList([], ts.NodeFlags.None) : 
                     ts.factory.createVariableDeclarationList([], ts.NodeFlags.None)
  );
} 