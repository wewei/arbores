/**
 * File Format Utilities
 * 
 * Utilities for handling different AST file formats (JSON, YAML).
 * These utilities are used by both core and CLI components.
 */

import * as yaml from 'js-yaml';

/**
 * Supported AST file formats
 */
export type ASTFileFormat = 'json' | 'yaml' | 'yml';

/**
 * Determine file format from file path extension
 */
export function getFormatFromPath(filePath: string): ASTFileFormat {
  const ext = filePath.split('.').pop()?.toLowerCase();
  if (ext === 'yaml' || ext === 'yml') {
    return 'yaml';
  }
  return 'json';
}

/**
 * Parse AST file content based on format
 */
export function parseASTFile(content: string, format: ASTFileFormat): any {
  if (format === 'yaml' || format === 'yml') {
    return yaml.load(content);
  }
  return JSON.parse(content);
}

/**
 * Serialize AST data to string based on format
 */
export function stringifyASTData(data: any, format: ASTFileFormat): string {
  if (format === 'yaml' || format === 'yml') {
    return yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      flowLevel: -1,  // 使用标准 YAML 块格式而非流格式
      condenseFlow: false
    });
  }
  return JSON.stringify(data, null, 2);
}
