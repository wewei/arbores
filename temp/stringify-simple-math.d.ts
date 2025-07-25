/**
 * Type definitions for stringify functions
 */

export interface StringifyOptions {
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
}

/**
 * Main stringify function type
 */
export type StringifySimpleMathFunction = (
  node: Expression, 
  options?: StringifyOptions
) => string;

/**
 * Export the main stringify function
 */
export declare const stringifySimpleMath: StringifySimpleMathFunction;