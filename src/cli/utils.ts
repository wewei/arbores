/**
 * CLI Utilities
 * 
 * Common utilities for CLI commands including output formatting,
 * error handling, and file I/O operations.
 */

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { ArborError, type Result } from '../core';

// =============================================================================
// Types
// =============================================================================

/**
 * Output format for query results
 */
export type QueryOutputFormat = 'json' | 'yaml' | 'markdown';

/**
 * Output format for stringify results  
 */
export type StringifyOutputFormat = 'compact' | 'readable' | 'minified';

/**
 * Common CLI options
 */
export interface CommonOptions {
  output?: string;
  verbose?: boolean;
}

/**
 * Query command options
 */
export interface QueryOptions extends CommonOptions {
  format?: QueryOutputFormat;
}

/**
 * Stringify command options
 */
export interface StringifyOptions extends CommonOptions {
  format?: StringifyOutputFormat;
}

// =============================================================================
// File I/O
// =============================================================================

/**
 * Read file content asynchronously
 */
export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.promises.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Write file content asynchronously with directory creation
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    // 确保目录存在
    const path = await import('path');
    const dir = path.dirname(filePath);
    // 只有当目录不是当前目录时才创建
    if (dir !== '.' && dir !== '') {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Parse AST file (supports both JSON and YAML formats)
 */
export async function parseASTFile(filePath: string): Promise<any> {
  const content = await readFile(filePath);
  const ext = filePath.toLowerCase();
  
  try {
    if (ext.endsWith('.yaml') || ext.endsWith('.yml')) {
      // Parse YAML format
      return yaml.load(content);
    } else {
      // Parse JSON format (default)
      return JSON.parse(content);
    }
  } catch (error) {
    const formatType = ext.endsWith('.yaml') || ext.endsWith('.yml') ? 'YAML' : 'JSON';
    throw new Error(`Invalid ${formatType} in AST file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// =============================================================================
// Output Formatting
// =============================================================================

/**
 * Format data for query output
 */
export function formatQueryOutput(data: any, format: QueryOutputFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    
    case 'yaml':
      return yaml.dump(data, { 
        indent: 2,
        lineWidth: 120,
        noRefs: true
      });
    
    case 'markdown':
      return formatAsMarkdown(data);
    
    default:
      throw new Error(`Unsupported query output format: ${format}`);
  }
}

/**
 * Format data as markdown (basic implementation)
 */
function formatAsMarkdown(data: any): string {
  if (Array.isArray(data)) {
    let md = '# Results\n\n';
    data.forEach((item, index) => {
      md += `## Item ${index + 1}\n\n`;
      md += '```json\n';
      md += JSON.stringify(item, null, 2);
      md += '\n```\n\n';
    });
    return md;
  } else if (typeof data === 'object' && data !== null) {
    let md = '# Result\n\n';
    md += '```json\n';
    md += JSON.stringify(data, null, 2);
    md += '\n```\n';
    return md;
  } else {
    return `# Result\n\n${String(data)}\n`;
  }
}

/**
 * Format data as aligned table for terminal output
 */
export function formatAlignedTable(headers: string[], rows: string[][]): string {
  if (rows.length === 0) {
    return headers.join(' | ');
  }
  
  // Calculate column widths
  const colWidths = headers.map((header, colIndex) => {
    const columnValues = [header, ...rows.map(row => row[colIndex] || '')];
    return Math.max(...columnValues.map(val => val.length));
  });
  
  // Format header
  const headerRow = headers.map((header, i) => header.padEnd(colWidths[i] || 0)).join(' | ');
  const separatorRow = colWidths.map(width => '-'.repeat(width)).join(' | ');
  
  // Format data rows
  const dataRows = rows.map(row => 
    row.map((cell, i) => (cell || '').padEnd(colWidths[i] || 0)).join(' | ')
  );
  
  return [headerRow, separatorRow, ...dataRows].join('\n');
}

// =============================================================================
// Error Handling
// =============================================================================

/**
 * Handle API results and output/exit appropriately
 */
export function handleResult<T>(result: Result<T>, options: { verbose?: boolean } = {}): T {
  if (result.success) {
    return result.data;
  } else {
    handleError(result.error, options);
    process.exit(1);
  }
}

/**
 * Handle errors with appropriate formatting and logging
 */
export function handleError(error: ArborError | Error, options: { verbose?: boolean } = {}): void {
  if (error instanceof ArborError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    
    if (options.verbose) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
  } else {
    console.error(`Error: ${error.message}`);
    
    if (options.verbose) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
  }
}

/**
 * Output data to stdout or file
 */
export async function outputData(data: string, outputPath?: string): Promise<void> {
  if (outputPath) {
    await writeFile(outputPath, data);
    console.log(`Output written to: ${outputPath}`);
  } else {
    console.log(data);
  }
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate query output format
 */
export function isValidQueryFormat(format: any): format is QueryOutputFormat {
  return typeof format === 'string' && ['json', 'yaml', 'markdown'].includes(format);
}

/**
 * Validate stringify output format
 */
export function isValidStringifyFormat(format: any): format is StringifyOutputFormat {
  return typeof format === 'string' && ['compact', 'readable', 'minified'].includes(format);
}

/**
 * Get default query output format
 */
export function getDefaultQueryFormat(): QueryOutputFormat {
  return 'json';
}

/**
 * Get default stringify output format
 */
export function getDefaultStringifyFormat(): StringifyOutputFormat {
  return 'readable';
}
