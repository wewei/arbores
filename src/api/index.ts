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
  type NodeInfo,
  type VersionInfo,
  type ParseResult,
  type ParseStats,
  ArborError,
  success,
  error,
  isSuccess,
  isError,
  convertASTNodeToNodeInfo,
  convertFileVersionToVersionInfo
} from './types';

// Export Parser API
export {
  parseCode
} from './parser';

// Note: Query and Stringify APIs will be exported here once implemented
// export { getRoots, getNode, getChildren, getParents } from './query';
// export { stringifyNode, stringifyAST } from './stringify';
