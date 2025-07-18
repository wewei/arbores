import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建变量声明列表节点
 * 
 * VariableDeclarationList 结构:
 * - children[0]: const/let/var 关键字
 * - children[1]: VariableDeclaration
 * 
 * 示例: const a = 1
 */
export const createVariableDeclarationList: NodeBuilderFn<ts.VariableDeclarationList> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.VariableDeclarationList => {
  const children = node.children || [];
  const declarations: ts.VariableDeclaration[] = [];
  
  // 查找变量声明 (可能在 SyntaxList 中)
  const findVariableDeclarations = (nodeId: string): void => {
    const child = sourceFile.nodes[nodeId];
    if (!child) return;
    
    if (child.kind === ts.SyntaxKind.VariableDeclaration) {
      const varDecl = createNode(sourceFile, child) as ts.VariableDeclaration;
      declarations.push(varDecl);
    } else if (child.children) {
      // 递归查找子节点
      for (const grandChildId of child.children) {
        findVariableDeclarations(grandChildId);
      }
    }
  };
  
  for (const childId of children) {
    findVariableDeclarations(childId);
  }
  
  // 检查是否有 const/let/var 关键字
  let flags = ts.NodeFlags.None;
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (child) {
      if (child.kind === ts.SyntaxKind.ConstKeyword) {
        flags = ts.NodeFlags.Const;
      } else if (child.kind === ts.SyntaxKind.LetKeyword) {
        flags = ts.NodeFlags.Let;
      }
    }
  }
  
  return ts.factory.createVariableDeclarationList(declarations, flags);
};
