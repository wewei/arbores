/**
 * Output formatting utilities for CLI
 */

import type { ASTNode, FileVersion, SourceFileAST } from '../../api/types';
import type { OutputFormat } from './file-io';

/**
 * Format data for console output
 */
export function formatOutput(data: any, format: OutputFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'compact':
      return JSON.stringify(data);
    case 'yaml':
      // Simple YAML-like format for basic data structures
      return formatAsYAML(data);
    default:
      return JSON.stringify(data, null, 2);
  }
}

/**
 * Simple YAML-like formatter
 */
function formatAsYAML(data: any, indent: number = 0): string {
  const spaces = ' '.repeat(indent);
  
  if (data === null || data === undefined) {
    return 'null';
  }
  
  if (typeof data === 'string') {
    return `"${data}"`;
  }
  
  if (typeof data === 'number' || typeof data === 'boolean') {
    return String(data);
  }
  
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return '[]';
    }
    const items = data.map(item => `${spaces}- ${formatAsYAML(item, indent + 2)}`);
    return '\n' + items.join('\n');
  }
  
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return '{}';
    }
    const items = keys.map(key => {
      const value = formatAsYAML(data[key], indent + 2);
      if (value.startsWith('\n')) {
        return `${spaces}${key}:${value}`;
      } else {
        return `${spaces}${key}: ${value}`;
      }
    });
    return '\n' + items.join('\n');
  }
  
  return String(data);
}

/**
 * Format AST node for readable display
 */
export function formatNodeSummary(node: ASTNode): string {
  const childCount = node.children ? node.children.length : 0;
  const hasText = node.text ? ` (${node.text.length} chars)` : '';
  
  return `Node ${node.id}: Kind ${node.kind}${hasText}, ${childCount} children`;
}

/**
 * Format version info for readable display
 */
export function formatVersionSummary(version: FileVersion): string {
  const desc = version.description ? ` - ${version.description}` : '';
  return `Version: ${version.created_at} -> Root ${version.root_node_id}${desc}`;
}

/**
 * Format AST statistics
 */
export function formatASTStats(ast: SourceFileAST): string {
  const nodeCount = Object.keys(ast.nodes).length;
  const versionCount = ast.versions.length;
  const latestVersion = ast.versions[ast.versions.length - 1];
  
  return [
    `File: ${ast.file_name}`,
    `Nodes: ${nodeCount}`,
    `Versions: ${versionCount}`,
    latestVersion ? `Latest: ${latestVersion.created_at}` : 'No versions'
  ].join('\n');
}

/**
 * Format error for console output
 */
export function formatError(error: Error): string {
  return `Error: ${error.message}`;
}

/**
 * Format success message
 */
export function formatSuccess(message: string): string {
  return `✅ ${message}`;
}

/**
 * Format warning message
 */
export function formatWarning(message: string): string {
  return `⚠️  ${message}`;
}

/**
 * Format info message
 */
export function formatInfo(message: string): string {
  return `ℹ️  ${message}`;
}
