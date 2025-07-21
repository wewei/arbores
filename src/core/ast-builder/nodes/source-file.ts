import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { findChildByKind, getChildNodes } from '../utils/find-child';
import { extractFromSyntaxList } from '../utils/syntax-list';

/**
 * 创建源文件节点
 */
export const createSourceFile: NodeBuilderFn<ts.SourceFile> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.SourceFile => {
    const statements: ts.Statement[] = [];
    
    // 从子节点中提取所有语句，自动处理 SyntaxList 包装器
    const allNodes = extractFromSyntaxList(node.children || [], sourceFile);
    
    for (const stmtNode of allNodes) {
      try {
        // 跳过 EndOfFileToken
        if (stmtNode.kind === ts.SyntaxKind.EndOfFileToken) {
          continue;
        }
        
        const statement = createNode(sourceFile, stmtNode) as ts.Statement;
        statements.push(statement);
      } catch (error) {
        console.warn(`Failed to create statement for ${ts.SyntaxKind[stmtNode.kind]}:`, error);
      }
    }
    
    return ts.factory.createSourceFile(
      statements,
      ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None
    );
  };
};
