import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';

// 创建变量声明列表节点
export function createVariableDeclarationListNode(node: ASTNode, ast: SourceFileAST): ts.VariableDeclarationList {
  return ts.factory.createVariableDeclarationList([], ts.NodeFlags.None);
} 