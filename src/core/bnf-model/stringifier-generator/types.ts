/**
 * Type definitions for BNF Model Stringifier Generator
 */

import type { BNFModel } from '../types';

/**
 * Configuration for stringifier function generation
 */
export interface StringifierConfig {
  /** Function name prefix (default: 'stringifier') */
  functionPrefix?: string;
  /** Indentation style (default: '  ') */
  indentStyle?: string;
  /** Whether to include whitespace handling (default: true) */
  includeWhitespace?: boolean;
  /** Whether to include formatting options (default: true) */
  includeFormatting?: boolean;
  /** Custom type mappings for generated nodes */
  typeMapping?: Record<string, string>;
}

/**
 * Options passed to stringifier functions at runtime
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
}

/**
 * Result of stringifier generation
 */
export interface StringifierGenerationResult {
  /** Whether generation was successful */
  success: boolean;
  /** Generated file paths and their contents */
  files?: Map<string, string>;
  /** Deprecated: Combined code for backward compatibility */
  code?: string;
  /** Deprecated: Type definitions for backward compatibility */
  types?: string;
  /** Warnings during generation */
  warnings?: string[];
  /** Errors during generation */
  errors?: string[];
}

/**
 * State type that replaces the StringifierGenerator class
 */
export interface StringifierGeneratorState {
  readonly model: BNFModel;
  readonly config: StringifierConfig;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}
