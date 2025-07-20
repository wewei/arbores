import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { findChildByKind, getChildNodes } from '../utils/find-child';

/**
 * 创建源文件节点
 */
export const createSourceFile: NodeBuilderFn<ts.SourceFile> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.SourceFile => {
    const statements: ts.Statement[] = [];
    
    // 查找 SyntaxList，SourceFile 的 children 通常包含一个 SyntaxList
    const syntaxListNode = findChildByKind(node.children || [], sourceFile, ts.SyntaxKind.SyntaxList);
    
    if (syntaxListNode) {
      const stmtNodes = getChildNodes(syntaxListNode, sourceFile);
      for (const stmtNode of stmtNodes) {
        try {
          // 跳过EndOfFileToken
          if (stmtNode.kind === ts.SyntaxKind.EndOfFileToken) {
            continue;
          }
          
          const statement = createNode(sourceFile, stmtNode) as ts.Statement;
          statements.push(statement);
        } catch (error) {
          console.warn(`Failed to create statement for ${ts.SyntaxKind[stmtNode.kind]}:`, error);
        }
      }
    }
    
    return ts.factory.createSourceFile(
      statements,
      ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None
    );
  };
};
