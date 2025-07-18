import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { createVariableDeclarationNode } from './variable-declaration';
 
// 创建变量声明列表节点
export function createVariableDeclarationListNode(node: ASTNode, ast: SourceFileAST): ts.VariableDeclarationList {
  const children = node.children || [];
  const declarations: ts.VariableDeclaration[] = [];
  
  // 确定声明类型标志
  let flags = ts.NodeFlags.None;
  let hasConst = false;
  let hasLet = false;
  
  for (const childId of children) {
    const childNode = ast.nodes[childId];
    if (childNode) {
      switch (childNode.kind) {
        case ts.SyntaxKind.ConstKeyword:
          hasConst = true;
          flags |= ts.NodeFlags.Const;
          break;
        case ts.SyntaxKind.LetKeyword:
          hasLet = true;
          flags |= ts.NodeFlags.Let;
          break;
        case ts.SyntaxKind.SyntaxList:
          // 在 SyntaxList 中查找 VariableDeclaration
          if (childNode.children) {
            for (const grandChildId of childNode.children) {
              const grandChildNode = ast.nodes[grandChildId];
              if (grandChildNode && grandChildNode.kind === ts.SyntaxKind.VariableDeclaration) {
                declarations.push(createVariableDeclarationNode(grandChildNode, ast));
              }
            }
          }
          break;
        case ts.SyntaxKind.VariableDeclaration:
          declarations.push(createVariableDeclarationNode(childNode, ast));
          break;
      }
    }
  }
  
  return ts.factory.createVariableDeclarationList(declarations, flags);
} 