/**
 * Types for Schema Generator (Functional Version)
 * 
 * Type definitions for the functional schema generator system.
 * Replaces the class-based BNFCodeGenerator with immutable data structures.
 */

import type { BNFModel } from '../types';
import type { GenerationResult } from '../shared-types';

/**
 * Configuration for code generation
 */
export interface GenerationConfig {
  /** Path to common types file (e.g., 'src/core/bnf-model/types.ts') */
  commonTypeFile: string;
}

// Re-export shared type
export type { GenerationResult };

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
