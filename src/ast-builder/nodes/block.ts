import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { findChildByKind, getChildNodes } from '../utils/find-child';

/**
 * 创建块节点
 */
export const createBlock: NodeBuilderFn<ts.Block> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.Block => {
    const statements: ts.Statement[] = [];
    
    // 查找 SyntaxList，Block 的 children 通常是一个 SyntaxList
    const syntaxListNode = findChildByKind(node.children || [], sourceFile, ts.SyntaxKind.SyntaxList);
    
    if (syntaxListNode) {
      const stmtNodes = getChildNodes(syntaxListNode, sourceFile);
      for (const stmtNode of stmtNodes) {
        try {
          const statement = createNode(sourceFile, stmtNode) as ts.Statement;
          statements.push(statement);
        } catch (error) {
          console.warn(`Failed to create statement for ${ts.SyntaxKind[stmtNode.kind]}:`, error);
        }
      }
    }
    
    return ts.factory.createBlock(statements, true);
  };
};
