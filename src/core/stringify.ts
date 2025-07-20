/**
 * Arbores Stringify API
 * 
 * This module provides functionality to convert AST nodes back to TypeScript source code.
 * All functions follow the functional, stateless API design with Result<T> return types.
 */

import * as ts from 'typescript';
import { createNode } from './ast-builder';
import type { 
  Result,
  SourceFileAST,
  FileVersion
} from './types';
import { success, error } from './types';

/**
 * Format options for stringified output
 */
export type StringifyFormat = 'compact' | 'readable' | 'minified';

/**
 * Options for stringify operations
 */
export interface StringifyOptions {
  format?: StringifyFormat;
  removeComments?: boolean;
  omitTrailingSemicolon?: boolean;
  newLine?: ts.NewLineKind;
}

/**
 * Result of a stringify operation
 */
export interface StringifyResult {
  code: string;
  format: StringifyFormat;
  nodeId: string;
  nodeKind: string;
}

/**
 * Convert a single AST node to TypeScript source code
 * 
 * @param nodeId - ID of the node to stringify
 * @param ast - The AST containing the node
 * @param options - Stringify options
 * @returns Result containing the generated TypeScript code
 */
export function stringifyNode(
  nodeId: string,
  ast: SourceFileAST,
  options: StringifyOptions = {}
): Result<StringifyResult> {
  // Validate inputs
  if (!nodeId || typeof nodeId !== 'string') {
    return error('INVALID_ARGUMENT', 'Node ID must be a non-empty string');
  }
  
  if (!ast || typeof ast !== 'object') {
    return error('INVALID_ARGUMENT', 'AST must be a valid object');
  }

  if (!ast.nodes || typeof ast.nodes !== 'object') {
    return error('INVALID_AST', 'AST must contain a nodes object');
  }

  // Find the target node
  const node = ast.nodes[nodeId];
  if (!node) {
    return error('NODE_NOT_FOUND', `Node with ID ${nodeId} not found in AST`);
  }

  const format = options.format || 'readable';

  try {
    // For nodes with direct text, return it
    if (node.text && typeof node.text === 'string') {
      return success({
        code: node.text,
        format,
        nodeId,
        nodeKind: ts.SyntaxKind[node.kind] || 'Unknown'
      });
    }

    // For complex nodes, use TypeScript Factory API
    const tsNode = createNode(ast, node);
    
    if (!tsNode || tsNode.kind === ts.SyntaxKind.Unknown) {
      return error('STRINGIFY_FAILED', 
        `Failed to create TypeScript node for ${nodeId} (${ts.SyntaxKind[node.kind]})`);
    }

    // Configure printer based on format and options
    const printerOptions: ts.PrinterOptions = {
      newLine: options.newLine || (format === 'minified' 
        ? ts.NewLineKind.CarriageReturnLineFeed 
        : ts.NewLineKind.LineFeed),
      removeComments: options.removeComments ?? (format === 'minified'),
      omitTrailingSemicolon: options.omitTrailingSemicolon ?? (format === 'minified')
    };

    const printer = ts.createPrinter(printerOptions);

    // Create temporary SourceFile for printing
    const tempSourceFile = ts.createSourceFile(
      'temp.ts',
      '',
      ts.ScriptTarget.Latest,
      true
    );

    const code = printer.printNode(
      ts.EmitHint.Unspecified,
      tsNode,
      tempSourceFile
    );

    return success({
      code,
      format,
      nodeId,
      nodeKind: ts.SyntaxKind[node.kind] || 'Unknown'
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return error('STRINGIFY_FAILED', 
      `Error stringifying node ${nodeId} (${ts.SyntaxKind[node.kind]}): ${errorMsg}`);
  }
}

/**
 * Stringify multiple nodes from an AST
 * 
 * @param nodeIds - Array of node IDs to stringify
 * @param ast - The AST containing the nodes
 * @param options - Stringify options
 * @returns Result containing array of stringify results
 */
export function stringifyNodes(
  nodeIds: string[],
  ast: SourceFileAST,
  options: StringifyOptions = {}
): Result<StringifyResult[]> {
  if (!Array.isArray(nodeIds)) {
    return error('INVALID_ARGUMENT', 'nodeIds must be an array');
  }

  const results: StringifyResult[] = [];
  
  for (const nodeId of nodeIds) {
    const result = stringifyNode(nodeId, ast, options);
    
    if (!result.success) {
      return error('STRINGIFY_FAILED', 
        `Failed to stringify node ${nodeId}: ${result.error.message}`);
    }
    
    results.push(result.data);
  }

  return success(results);
}

/**
 * Stringify an entire AST version to TypeScript source code
 * 
 * @param version - Version info containing root node
 * @param ast - The AST containing the nodes
 * @param options - Stringify options
 * @returns Result containing the generated TypeScript code for the entire version
 */
export function stringifyVersion(
  version: FileVersion,
  ast: SourceFileAST,
  options: StringifyOptions = {}
): Result<StringifyResult> {
  if (!version || typeof version !== 'object') {
    return error('INVALID_ARGUMENT', 'Version must be a valid object');
  }

  if (!version.root_node_id) {
    return error('INVALID_VERSION', 'Version must have a root_node_id');
  }

  return stringifyNode(version.root_node_id, ast, options);
}

/**
 * Get the latest version from an AST and stringify it
 * 
 * @param ast - The AST to stringify
 * @param options - Stringify options
 * @returns Result containing the generated TypeScript code for the latest version
 */
export function stringifyLatestVersion(
  ast: SourceFileAST,
  options: StringifyOptions = {}
): Result<StringifyResult> {
  if (!ast || typeof ast !== 'object') {
    return error('INVALID_ARGUMENT', 'AST must be a valid object');
  }

  if (!ast.versions || !Array.isArray(ast.versions) || ast.versions.length === 0) {
    return error('INVALID_AST', 'AST must contain at least one version');
  }

  const latestVersion = ast.versions[ast.versions.length - 1];
  if (!latestVersion) {
    return error('INVALID_AST', 'Latest version is undefined');
  }

  return stringifyVersion(latestVersion, ast, options);
}

/**
 * Utility function to validate stringify format
 * 
 * @param format - Format to validate
 * @returns true if format is valid
 */
export function isValidStringifyFormat(format: any): format is StringifyFormat {
  return typeof format === 'string' && 
    ['compact', 'readable', 'minified'].includes(format);
}
