/**
 * File I/O utilities for CLI operations
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { SourceFileAST } from '../../api/types';

/**
 * Supported output formats
 */
export type OutputFormat = 'json' | 'yaml' | 'compact';

/**
 * Load AST from file
 */
export async function loadAST(filePath: string): Promise<SourceFileAST> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as SourceFileAST;
  } catch (error) {
    throw new Error(`Failed to load AST from ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Save AST to file
 */
export async function saveAST(ast: SourceFileAST, filePath: string, format: OutputFormat = 'json'): Promise<void> {
  try {
    let content: string;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(ast, null, 2);
        break;
      case 'compact':
        content = JSON.stringify(ast);
        break;
      case 'yaml':
        // For now, use JSON format for YAML (could add yaml library later)
        content = JSON.stringify(ast, null, 2);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save AST to ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read source code from file
 */
export async function readSourceFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read source file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create empty AST structure
 */
export function createEmptyAST(fileName: string): SourceFileAST {
  return {
    file_name: fileName,
    versions: [],
    nodes: {}
  };
}

/**
 * Infer output format from file extension
 */
export function inferFormat(filePath: string): OutputFormat {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.yaml':
    case '.yml':
      return 'yaml';
    case '.json':
      return 'json';
    default:
      return 'json';
  }
}
