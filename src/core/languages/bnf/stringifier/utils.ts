/**
 * Utility functions for BNFGrammar stringifier
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.932Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { StringifierOptions } from './types';

/**
 * Get indentation string based on options
 */
export function getIndentation(options: StringifierOptions): string {
  const level = options.indent || 0;
  const indentStr = options.indentString || '  ';
  return indentStr.repeat(level);
}

/**
 * Add formatting whitespace if enabled
 */
export function addWhitespace(parts: string[], options: StringifierOptions, type: 'space' | 'newline' = 'space'): void {
  if (options.format && options.includeWhitespace) {
    if (type === 'newline') {
      parts.push('\n');
    } else {
      parts.push(' ');
    }
  }
}

/**
 * Format token output with optional spacing
 */
export function formatToken(value: string, options: StringifierOptions, context?: string): string {
  if (!options.format || !options.includeWhitespace) {
    return value;
  }

  // Add context-specific formatting rules here
  if (options.formatting?.spaceAround?.includes(value)) {
    return ` ${value} `;
  }

  return value;
}