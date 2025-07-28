/**
 * Shared types for BNF Model Generators
 * 
 * Common type definitions used across schema and stringifier generators.
 */

/**
 * Result of code generation (shared between schema and stringifier generators)
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
