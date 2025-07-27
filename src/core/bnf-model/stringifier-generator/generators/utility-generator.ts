/**
 * Utility functions for generated stringifier code
 */

/**
 * Generate utility functions
 */
export const generateUtilityFunctions = (): string => {
  return `/**
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
      parts.push('\\n');
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
    return \` \${value} \`;
  }

  return value;
}`;
};
