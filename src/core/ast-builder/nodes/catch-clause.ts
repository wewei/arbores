import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createCatchClause: NodeBuilderFn<ts.CatchClause> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.CatchClause => {
    const children = node.children || [];
    
    if (children.length < 2) {
      throw new Error(`CatchClause should have at least 2 children (catch, block), got ${children.length}`);
    }
    
    // CatchClause的结构：[catch关键字, (, variableDeclaration?, ), block]
    let catchKeywordId = children[0];
    let variableDeclarationId: string | undefined;
    let blockId: string | undefined;
    
    // 找到各个组件
    for (let i = 0; i < children.length; i++) {
      const childId = children[i];
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      if (childNode.kind === ts.SyntaxKind.VariableDeclaration) {
        variableDeclarationId = childId;
      } else if (childNode.kind === ts.SyntaxKind.Block) {
        blockId = childId;
      }
    }
    
    if (!blockId) {
      throw new Error('CatchClause missing block');
    }
    
    // 创建变量声明（如果存在）
    let variableDeclaration: ts.VariableDeclaration | undefined;
    if (variableDeclarationId) {
      const variableDeclarationNode = sourceFile.nodes[variableDeclarationId];
      if (variableDeclarationNode) {
        variableDeclaration = createNode(sourceFile, variableDeclarationNode) as ts.VariableDeclaration;
      }
    }
    
    // 创建block
    const blockNode = sourceFile.nodes[blockId];
    if (!blockNode) {
      throw new Error(`Block node ${blockId} not found`);
    }
    const block = createNode(sourceFile, blockNode) as ts.Block;
    
    return ts.factory.createCatchClause(variableDeclaration, block);
  };
};
