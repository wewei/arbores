/**
 * API Types - Core types for Arbores API v5
 * 
 * This module defines the core types used throughout the Arbores API,
 * including the Result<T> type for functional error handling.
 * Data types are re-exported from src/types.ts to avoid duplication.
 */

// Re-export all existing types from src/types.ts
export type {
  CommentInfo,
  ASTNode,
  FileVersion,
  SourceFileAST,
  ParseOptions
} from '../types.js';

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
  ast: import('../types').SourceFileAST;
  rootNodeId: string;
  stats: ParseStats;
}
