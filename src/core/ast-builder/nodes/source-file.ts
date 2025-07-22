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
    
    // 记录 SourceFile 的 leadingComments，需要传递给第一个语句
    const sourceFileComments = node.leadingComments;
    
    let firstStatementProcessed = false;
    
    for (const stmtNode of allNodes) {
      try {
        // 跳过 EndOfFileToken
        if (stmtNode.kind === ts.SyntaxKind.EndOfFileToken) {
          continue;
        }
        
        const statement = createNode(sourceFile, stmtNode) as ts.Statement;
        
        // 如果这是第一个语句且SourceFile有leadingComments，添加到这个语句
        if (!firstStatementProcessed && sourceFileComments && sourceFileComments.length > 0) {
          // 创建synthetic comments
          const syntheticComments: ts.SynthesizedComment[] = sourceFileComments.map(comment => {
            let commentText = comment.text;
            
            // 对于多行注释，移除包装的注释标记，但保留JSDoc格式
            if (comment.kind === 'MultiLineCommentTrivia') {
              const isJSDoc = commentText.startsWith('/**');
              commentText = commentText.replace(/^\/\*\*?/, '').replace(/\*\/$/, '');
              if (isJSDoc) {
                commentText = '*' + commentText;
              }
            } else if (comment.kind === 'SingleLineCommentTrivia') {
              commentText = commentText.replace(/^\/\//, '');
            }
            
            return {
              kind: comment.kind === 'MultiLineCommentTrivia' 
                ? ts.SyntaxKind.MultiLineCommentTrivia 
                : ts.SyntaxKind.SingleLineCommentTrivia,
              text: commentText,
              hasTrailingNewLine: true,
              pos: -1,
              end: -1
            };
          });
          
          // 获取现有的leadingComments（如果有的话）
          const existingComments = ts.getSyntheticLeadingComments(statement) || [];
          
          // 合并注释：SourceFile的注释在前
          ts.setSyntheticLeadingComments(statement, [...syntheticComments, ...existingComments]);
          
          firstStatementProcessed = true;
        }
        
        statements.push(statement);
      } catch (error) {
        console.warn(`Failed to create statement for ${ts.SyntaxKind[stmtNode.kind]} (node ${stmtNode.id}):`, error);
        // 重新抛出错误以便上层能够看到具体的问题
        throw error;
      }
    }
    
    return ts.factory.createSourceFile(
      statements,
      ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None
    );
  };
};
