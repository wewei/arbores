/**
 * Parser API - Functional TypeScript parsing interface
 * 
 * This module provides a pure functional API for parsing TypeScript code into AST.
 * All functions are stateless and return Result<T> for error handling.
 */

import type { SourceFileAST } from '../types.js';
import { 
  success, 
  error, 
  type Result, 
  type ParseResult, 
  type ParseStats 
} from './types.js';
import { parseTypeScriptFile, mergeAST } from '../parser.js';

/**
 * Parse TypeScript source code into AST
 * 
 * @param sourceCode - TypeScript source code string
 * @param baseAST - Base AST to add parsed nodes to (creates empty if not provided)
 * @returns Result containing ParseResult or error
 * 
 * @example
 * ```typescript
 * const result = parseCode('const x = 1;', createEmptyAST());
 * if (result.success) {
 *   console.log('Parsed successfully:', result.data.rootNodeId);
 * } else {
 *   console.error('Parse error:', result.error.message);
 * }
 * ```
 */
export function parseCode(
  sourceCode: string, 
  baseAST: SourceFileAST
): Result<ParseResult> {
  try {
    const startTime = performance.now();
    
    // Validate inputs
    if (typeof sourceCode !== 'string') {
      return error('PARSE_ERROR', 'Source code must be a string');
    }
    
    if (!baseAST || typeof baseAST !== 'object') {
      return error('INVALID_AST_STRUCTURE', 'Base AST must be a valid SourceFileAST object');
    }

    if (!baseAST.nodes || typeof baseAST.nodes !== 'object') {
      return error('INVALID_AST_STRUCTURE', 'Base AST must have a nodes object');
    }

    // Count nodes before parsing
    const nodeCountBefore = Object.keys(baseAST.nodes).length;

    // Parse TypeScript code to create new AST
    const tempFileName = baseAST.file_name || 'temp.ts';
    const newAST = parseTypeScriptFile(tempFileName, sourceCode);
    
    // Validate that parsing was successful
    if (!newAST.versions || newAST.versions.length === 0) {
      return error('PARSE_ERROR', 'Failed to create AST version');
    }
    
    // Create merged AST by combining nodes
    const mergedNodes = { ...baseAST.nodes, ...newAST.nodes };
    const newVersion = newAST.versions[0]!; // We validated versions.length > 0 above
    
    const parseResult: SourceFileAST = {
      file_name: baseAST.file_name,
      versions: [...baseAST.versions, newVersion],
      nodes: mergedNodes
    };
    
    const endTime = performance.now();
    
    // Extract the root node ID from the latest version
    const rootNodeId = newVersion.root_node_id;
    
    // Calculate statistics
    const nodeCountAfter = Object.keys(mergedNodes).length;
    const stats: ParseStats = {
      nodeCount: nodeCountAfter - nodeCountBefore,
      commentCount: countComments(newAST),
      parseTime: endTime - startTime,
      sourceSize: sourceCode.length
    };

    const result: ParseResult = {
      ast: parseResult,
      rootNodeId: rootNodeId,
      stats: stats
    };

    return success(result);
    
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown parse error';
    return error('PARSE_ERROR', `Failed to parse TypeScript code: ${errorMessage}`);
  }
}

/**
 * Create an empty AST structure for use as baseAST
 * 
 * @param fileName - Optional file name for the AST
 * @returns Empty SourceFileAST structure
 */
export function createEmptyAST(fileName: string = 'unknown'): SourceFileAST {
  return {
    file_name: fileName,
    versions: [],
    nodes: {}
  };
}

/**
 * Validate that an object is a valid SourceFileAST structure
 * 
 * @param ast - Object to validate
 * @returns Result indicating if AST is valid
 */
export function validateAST(ast: unknown): Result<SourceFileAST> {
  if (!ast || typeof ast !== 'object') {
    return error('INVALID_AST_STRUCTURE', 'AST must be an object');
  }

  const astObj = ast as Record<string, unknown>;

  if (typeof astObj.file_name !== 'string') {
    return error('INVALID_AST_STRUCTURE', 'AST must have a file_name string property');
  }

  if (!Array.isArray(astObj.versions)) {
    return error('INVALID_AST_STRUCTURE', 'AST must have a versions array property');
  }

  if (!astObj.nodes || typeof astObj.nodes !== 'object') {
    return error('INVALID_AST_STRUCTURE', 'AST must have a nodes object property');
  }

  // Validate versions structure
  for (let i = 0; i < astObj.versions.length; i++) {
    const version = astObj.versions[i];
    if (!version || typeof version !== 'object') {
      return error('INVALID_AST_STRUCTURE', `Version ${i} must be an object`);
    }

    const versionObj = version as Record<string, unknown>;
    if (typeof versionObj.created_at !== 'string') {
      return error('INVALID_AST_STRUCTURE', `Version ${i} must have a created_at string`);
    }

    if (typeof versionObj.root_node_id !== 'string') {
      return error('INVALID_AST_STRUCTURE', `Version ${i} must have a root_node_id string`);
    }
  }

  return success(astObj as SourceFileAST);
}

/**
 * Helper function to count comments in parsed AST
 */
function countComments(ast: SourceFileAST): number {
  let commentCount = 0;
  
  // Count comments in all nodes
  for (const nodeId in ast.nodes) {
    const node = ast.nodes[nodeId];
    if (node) {
      if (node.leadingComments) {
        commentCount += node.leadingComments.length;
      }
      if (node.trailingComments) {
        commentCount += node.trailingComments.length;
      }
    }
  }
  
  return commentCount;
}
