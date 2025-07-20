import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createTryStatement: NodeBuilderFn<ts.TryStatement> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TryStatement => {
    const children = node.children || [];
    
    if (children.length < 2) {
      throw new Error(`TryStatement should have at least 2 children (try, block), got ${children.length}`);
    }
    
    // TryStatement的结构：[try关键字, tryBlock, catchClause?, finallyBlock?]
    const tryKeywordId = children[0];
    const tryBlockId = children[1];
    let catchClauseId: string | undefined;
    let finallyBlockId: string | undefined;
    
    // 查找catch和finally子句
    for (let i = 2; i < children.length; i++) {
      const childId = children[i];
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      if (childNode.kind === ts.SyntaxKind.CatchClause) {
        catchClauseId = childId;
      } else if (childNode.kind === ts.SyntaxKind.FinallyKeyword) {
        // finally关键字后面应该跟着block
        if (i + 1 < children.length) {
          finallyBlockId = children[i + 1];
        }
      }
    }
    
    if (!tryBlockId) {
      throw new Error('TryStatement missing try block');
    }
    
    // 创建try block
    const tryBlockNode = sourceFile.nodes[tryBlockId];
    if (!tryBlockNode) {
      throw new Error(`Try block node ${tryBlockId} not found`);
    }
    const tryBlock = createNode(sourceFile, tryBlockNode) as ts.Block;
    
    // 创建catch clause（如果存在）
    let catchClause: ts.CatchClause | undefined;
    if (catchClauseId) {
      const catchClauseNode = sourceFile.nodes[catchClauseId];
      if (catchClauseNode) {
        catchClause = createNode(sourceFile, catchClauseNode) as ts.CatchClause;
      }
    }
    
    // 创建finally block（如果存在）
    let finallyBlock: ts.Block | undefined;
    if (finallyBlockId) {
      const finallyBlockNode = sourceFile.nodes[finallyBlockId];
      if (finallyBlockNode) {
        finallyBlock = createNode(sourceFile, finallyBlockNode) as ts.Block;
      }
    }
    
    return ts.factory.createTryStatement(tryBlock, catchClause, finallyBlock);
  };
};
