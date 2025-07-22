/**
 * API Types - Core types for Arbores API v5
 * 
 * This module defines all core types used throughout the Arbores API,
 * including data types and the Result<T> type for functional error handling.
 */

// =============================================================================
// Core Data Types (formerly from src/types.ts)
// =============================================================================

// Comment 信息类型 - 不包含位置信息，只关心内容
export type CommentInfo = {
  kind: 'SingleLineCommentTrivia' | 'MultiLineCommentTrivia';
  text: string;
};

// AST 节点类型
export type ASTNode = {
  id: string;
  kind: number;
  text?: string;
  properties?: Record<string, any>;
  children?: string[];
  leadingComments?: CommentInfo[];
  trailingComments?: CommentInfo[];
};

// 文件版本类型
export type FileVersion = {
  created_at: string;
  root_node_id: string;
  description?: string;
};

// 源文件 AST 存储类型
export type SourceFileAST = {
  file_name: string;
  versions: FileVersion[];
  nodes: Record<string, ASTNode>;
};

// 解析选项类型
export type ParseOptions = {
  outputFile?: string;
  dryRun?: boolean;
  description?: string;
};

// 字符串化选项类型 (basic version, extended in stringify.ts)
export type StringifyOptions = {
  format?: 'compact' | 'readable' | 'minified';
};

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
  | 'INVALID_AST_STRUCTURE' // AST structure is malformed
  | 'INVALID_ARGUMENT'      // Invalid function argument
  | 'STRINGIFY_FAILED'      // Node stringify operation failed
  | 'INVALID_VERSION'       // Invalid version data
  | 'INVALID_AST';          // General AST validation error

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
// API-specific Result Types
// =============================================================================

/**
 * Statistics about parsed content
 */
export interface ParseStats {
  nodeCount: number;
  commentCount: number;
  parseTime: number;
  sourceSize: number;
}

/**
 * Result of parsing operations
 */
export interface ParseResult {
  ast: SourceFileAST;
  rootNodeId: string;
  stats: ParseStats;
}

// Tree rendering types
export interface TreeRenderOptions {
  /** Maximum line width before truncation */
  maxWidth?: number;
  
  /** Whether to show comments in tree output */
  showComments?: boolean;
  
  /** Whether to render token text content */
  showText?: boolean;
  
  /** Whether to show node IDs */
  showNodeIds?: boolean;
  
  /** Custom prefix for text content (default: "# ") */
  textPrefix?: string;
}

/**
 * A single line in the tree output
 */
export interface TreeLine {
  /** Tree structure prefix (├──, └──, etc.) */
  prefix: string;
  
  /** Main content (node type and kind info) */
  content: string;
  
  /** Optional text content */
  text?: string;
  
  /** Whether this line represents a comment */
  isComment?: boolean;
  
  /** Node ID (if showNodeIds is enabled) */
  nodeId?: string;
}
