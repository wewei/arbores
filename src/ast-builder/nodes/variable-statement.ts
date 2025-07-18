import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { findChildByKind, getChildNodes } from '../utils/find-child';

/**
 * 创建变量声明语句节点
 */
export const createVariableStatement: NodeBuilderFn<ts.VariableStatement> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.VariableStatement => {
    const children = getChildNodes(node, sourceFile);
    
    // 查找 VariableDeclarationList
    const varDeclListNode = findChildByKind(node.children || [], sourceFile, ts.SyntaxKind.VariableDeclarationList);
    
    if (varDeclListNode) {
      const varDeclList = createNode(sourceFile, varDeclListNode) as ts.VariableDeclarationList;
      return ts.factory.createVariableStatement(undefined, varDeclList);
    }
    
    // 如果没有找到 VariableDeclarationList，创建一个空的
    return ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList([], ts.NodeFlags.Const)
    );
  };
};
