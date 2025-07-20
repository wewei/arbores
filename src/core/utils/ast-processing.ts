/**
 * AST Processing Utilities
 * 
 * Core utilities for processing TypeScript AST nodes.
 * These utilities are used by the parser and other core components.
 */

import * as ts from 'typescript';
import * as crypto from 'crypto';
import type { CommentInfo } from '../types.js';

/**
 * Generate a unique ID for an AST node based on its content and structure
 */
export function generateNodeId(node: ts.Node): string {
  const content = {
    kind: node.kind,
    text: node.getText(),
    children: node.getChildren().map(child => generateNodeId(child))
  };
  
  return crypto.createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex')
    .substring(0, 16);
}

/**
 * Check if a SyntaxKind represents a token node
 */
export function isTokenNode(kind: number): boolean {
  return kind >= ts.SyntaxKind.FirstToken && kind <= ts.SyntaxKind.LastToken;
}

/**
 * Extract properties from specific node types
 */
export function extractNodeProperties(node: ts.Node): Record<string, any> | undefined {
  const properties: Record<string, any> = {};
  
  if (ts.isFunctionDeclaration(node)) {
    properties.name = node.name?.getText();
    properties.parameters = node.parameters.length;
    properties.isAsync = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword);
  } else if (ts.isVariableDeclaration(node)) {
    properties.name = node.name.getText();
    properties.hasInitializer = !!node.initializer;
  } else if (ts.isClassDeclaration(node)) {
    properties.name = node.name?.getText();
    properties.hasExtends = !!node.heritageClauses;
  } else if (ts.isInterfaceDeclaration(node)) {
    properties.name = node.name.getText();
    properties.hasExtends = !!node.heritageClauses;
  }
  
  return Object.keys(properties).length > 0 ? properties : undefined;
}

/**
 * Extract leading and trailing comments from a node
 */
export function extractComments(
  node: ts.Node, 
  sourceText: string
): { leadingComments?: CommentInfo[], trailingComments?: CommentInfo[] } {
  const result: { leadingComments?: CommentInfo[], trailingComments?: CommentInfo[] } = {};
  
  // 获取 leading comments
  const leadingCommentRanges = ts.getLeadingCommentRanges(sourceText, node.pos);
  if (leadingCommentRanges && leadingCommentRanges.length > 0) {
    result.leadingComments = leadingCommentRanges.map(commentRange => {
      const commentText = sourceText.substring(commentRange.pos, commentRange.end);
      return {
        kind: commentRange.kind === ts.SyntaxKind.SingleLineCommentTrivia 
          ? 'SingleLineCommentTrivia' as const
          : 'MultiLineCommentTrivia' as const,
        text: commentText
      };
    });
  }
  
  // 获取 trailing comments
  const trailingCommentRanges = ts.getTrailingCommentRanges(sourceText, node.end);
  if (trailingCommentRanges && trailingCommentRanges.length > 0) {
    result.trailingComments = trailingCommentRanges.map(commentRange => {
      const commentText = sourceText.substring(commentRange.pos, commentRange.end);
      return {
        kind: commentRange.kind === ts.SyntaxKind.SingleLineCommentTrivia 
          ? 'SingleLineCommentTrivia' as const
          : 'MultiLineCommentTrivia' as const,
        text: commentText
      };
    });
  }
  
  return result;
}
