/**
 * Header and import generation functions
 */

import type { StringifierGeneratorState } from '../types';
import { getUniqueNodeTypes } from '../utils';

/**
 * Generate file header with metadata
 */
export const generateFileHeader = (state: StringifierGeneratorState): string => {
  return `/**
 * stringifier functions for ${state.model.name} grammar
 * 
 * Generated from BNF model: ${state.model.name} v${state.model.version}
 * Generation time: ${new Date().toISOString()}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`;
};

/**
 * Generate import statements
 */
export const generateImports = (state: StringifierGeneratorState): string => {
  const imports: string[] = [];

  // Import node types
  const nodeTypes = getUniqueNodeTypes(state);
  if (nodeTypes.length > 0) {
    imports.push(`import type { ${nodeTypes.join(', ')} } from '../schema/index';`);
  }

  return imports.join('\n');
};

/**
 * Generate StringifierOptions type definition for the output file
 */
export const generateStringifierOptionsType = (): string => {
  return `/**
 * Options for stringifier functions
 */
export interface StringifierOptions {
  /** Current indentation level */
  indent?: number;
  /** Indentation string (spaces or tabs) */
  indentString?: string;
  /** Whether to include whitespace */
  includeWhitespace?: boolean;
  /** Whether to format output */
  format?: boolean;
  /** Custom formatting rules */
  formatting?: {
    /** Insert newlines after certain tokens */
    newlineAfter?: string[];
    /** Insert spaces around certain tokens */
    spaceAround?: string[];
    /** Compact mode (minimal whitespace) */
    compact?: boolean;
  };
}`;
};
