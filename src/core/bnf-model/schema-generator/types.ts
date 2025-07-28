/**
 * Types for Schema Generator (Functional Version)
 * 
 * Type definitions for the functional schema generator system.
 * Replaces the class-based BNFCodeGenerator with immutable data structures.
 */

import type { BNFModel } from '../types';

/**
 * Configuration for code generation
 */
export interface GenerationConfig {
  /** Base output directory */
  outputDir: string;
  /** Whether to generate separate files for each node type */
  separateFiles?: boolean;
  /** Whether to include JSDoc comments */
  includeDocumentation?: boolean;
  /** Custom naming conventions */
  naming?: {
    /** Suffix for token type names (default: 'Token') */
    tokenSuffix?: string;
    /** Suffix for node interface names (default: 'Node') */
    nodeSuffix?: string;
  };
}

/**
 * Result of code generation
 */
export interface GenerationResult {
  /** Whether generation was successful */
  success: boolean;
  /** Generated file paths and their contents */
  files?: Map<string, string>;
  /** Warnings during generation */
  warnings?: string[];
  /** Errors during generation */
  errors?: string[];
}

/**
 * Information about a generated file
 */
export interface GeneratedFile {
  /** Relative file path */
  path: string;
  /** File contents */
  content: string;
  /** File type for organization */
  type: 'token' | 'node' | 'union' | 'constants' | 'index';
}

/**
 * Schema generator state (immutable)
 */
export interface SchemaGeneratorState {
  readonly model: BNFModel;
  readonly config: GenerationConfig;
  readonly files: Map<string, string>;
  readonly warnings: string[];
  readonly errors: string[];
}

/**
 * Options for schema generation
 */
export interface SchemaGenerationOptions {
  /** Whether to validate model before generation */
  validateModel?: boolean;
  /** Whether to validate generated code */
  validateCode?: boolean;
  /** Custom file header generator */
  headerGenerator?: (description: string, model: BNFModel) => string;
}
