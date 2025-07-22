/**
 * Arbores API - Unified Export
 * 
 * This module provides a functional, stateless API for TypeScript AST operations.
 * All functions return Result<T> for type-safe error handling.
 */

// Export types
export {
  type Result,
  type ErrorCode,
  type ParseResult,
  type ParseStats,
  ArborError,
  success,
  error,
  isSuccess,
  isError,
  // Re-exported from src/types.ts
  type CommentInfo,
  type ASTNode,
  type FileVersion,
  type SourceFileAST,
  type ParseOptions,
  type TreeRenderOptions,
  type TreeLine
} from './types';

// Export Parser API
export {
  parseCode
} from './parser';

// Export Query API
export {
  getRoots,
  getNode,
  getChildren,
  getParents,
  getLatestRoot,
  getNodeWithKindName,
  validateAST
} from './query';

// Export Stringify API
export {
  stringifyNode,
  stringifyNodes,
  stringifyVersion,
  stringifyLatestVersion,
  isValidStringifyFormat,
  type StringifyFormat,
  type StringifyOptions,
  type StringifyResult
} from './stringify';

// Export Tree API
export {
  renderTree,
  renderTreeForCLI
} from './tree';
