/**
 * API Types - Core types for Arbores API v5
 * 
 * This module defines the core types used throughout the Arbores API,
 * including the Result<T> type for functional error handling and
 * data types that align with existing AST structures.
 */

import type { SourceFileAST, ASTNode, FileVersion, CommentInfo as ExistingCommentInfo } from '../types.js';

// =============================================================================
// Error Handling Types
// =============================================================================

/** 
 * Error codes for AST/data layer errors only
 * Does not include file I/O or CLI-specific errors
 */
export type ErrorCode = 
  | 'PARSE_ERROR'           // TypeScript parsing failed
  | 'NODE_NOT_FOUND'        // Requested node ID doesn't exist
  | 'INVALID_JSON'          // Invalid JSON structure
  | 'INVALID_AST_STRUCTURE'; // AST structure is malformed

/**
 * Unified error type for API operations
 * Uses message for user-friendly error descriptions
 */
export class ArborError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string
  ) {
    super(message);
    this.name = 'ArborError';
  }
}

/**
 * Result type for functional error handling
 * All API functions return Result<T> instead of throwing exceptions
 */
export type Result<T> = 
  | { success: true; data: T; }
  | { success: false; error: ArborError; };

// =============================================================================
// Helper Functions for Result<T>
// =============================================================================

/**
 * Create a success result
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Create an error result
 */
export function error<T>(code: ErrorCode, message: string): Result<T> {
  return { success: false, error: new ArborError(code, message) };
}

/**
 * Type guard to check if result is successful
 */
export function isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success;
}

/**
 * Type guard to check if result is an error
 */
export function isError<T>(result: Result<T>): result is { success: false; error: ArborError } {
  return !result.success;
}

// =============================================================================
// Data Types - Aligned with existing types.ts
// =============================================================================

/**
 * Comment information type - aligns with existing CommentInfo
 * Re-exported for API consistency
 */
export type CommentInfo = ExistingCommentInfo;

/**
 * Node information format - aligns with ASTNode but removes computed fields
 * Removes start/end/kindName as they're computed values
 */
export type NodeInfo = {
  id: string;
  kind: number;
  text?: string;
  properties?: Record<string, any>;
  children?: string[];
  leadingComments?: CommentInfo[];
  trailingComments?: CommentInfo[];
};

/**
 * Version information format - aligns with FileVersion
 */
export type VersionInfo = {
  created_at: string;
  root_node_id: string;
  description?: string;
};

/**
 * File information format
 */
export type FileInfo = {
  fileName: string;
  versions: VersionInfo[];
};

/**
 * Parse statistics information
 */
export type ParseStats = {
  nodeCount: number;
  commentCount: number;
  parseTime: number;
  sourceSize: number;
};

/**
 * Parse result containing AST and metadata
 */
export type ParseResult = {
  ast: SourceFileAST;
  rootNodeId: string;
  stats: ParseStats;
};

// =============================================================================
// Stringify Options
// =============================================================================

/**
 * Stringification options - aligns with existing StringifyOptions
 */
export type StringifyOptions = {
  format?: 'compact' | 'readable' | 'minified';
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Convert existing CommentInfo to API CommentInfo (they're the same type)
 */
export function convertCommentInfo(comment: ExistingCommentInfo): CommentInfo {
  return comment; // Same structure, just pass through
}

/**
 * Convert ASTNode to NodeInfo (removes computed fields)
 */
export function convertASTNodeToNodeInfo(node: ASTNode): NodeInfo {
  const nodeInfo: NodeInfo = {
    id: node.id,
    kind: node.kind
  };

  if (node.text !== undefined) {
    nodeInfo.text = node.text;
  }

  if (node.properties) {
    nodeInfo.properties = { ...node.properties };
  }

  if (node.children && node.children.length > 0) {
    nodeInfo.children = [...node.children];
  }

  if (node.leadingComments && node.leadingComments.length > 0) {
    nodeInfo.leadingComments = node.leadingComments.map(convertCommentInfo);
  }

  if (node.trailingComments && node.trailingComments.length > 0) {
    nodeInfo.trailingComments = node.trailingComments.map(convertCommentInfo);
  }

  return nodeInfo;
}

/**
 * Convert FileVersion to VersionInfo
 */
export function convertFileVersionToVersionInfo(version: FileVersion): VersionInfo {
  return {
    created_at: version.created_at,
    root_node_id: version.root_node_id,
    description: version.description
  };
}
