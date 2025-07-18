import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { findChildByKind, getChildNodes } from '../utils/find-child';

/**
 * 创建变量声明列表节点
 */
export const createVariableDeclarationList: NodeBuilderFn<ts.VariableDeclarationList> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.VariableDeclarationList => {
    const children = getChildNodes(node, sourceFile);
    const declarations: ts.VariableDeclaration[] = [];
    
    // 查找变量声明
    for (const child of children) {
      if (child.kind === ts.SyntaxKind.VariableDeclaration) {
        const varDecl = createNode(sourceFile, child) as ts.VariableDeclaration;
        declarations.push(varDecl);
      }
    }
    
    // 检查是否有 const/let/var 关键字
    let flags = ts.NodeFlags.None;
    const hasConst = children.some(child => child.kind === ts.SyntaxKind.ConstKeyword);
    const hasLet = children.some(child => child.kind === ts.SyntaxKind.LetKeyword);
    
    if (hasConst) {
      flags = ts.NodeFlags.Const;
    } else if (hasLet) {
      flags = ts.NodeFlags.Let;
    }
    
    return ts.factory.createVariableDeclarationList(declarations, flags);
  };
};
