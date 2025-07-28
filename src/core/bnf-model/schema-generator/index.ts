/**
 * BNF Model Schema Generator (Functional Version)
 * 
 * Main entry point for the functional schema generator.
 * Generates TypeScript type definitions from BNF models using pure functions.
 */

// Re-export types
export type {
  GenerationConfig,
  GenerationResult,
  GeneratedFile,
  SchemaGeneratorState,
  SchemaGenerationOptions
} from './types';

// Re-export state management
export {
  createSchemaGenerator,
  reset,
  validateModel,
  addFile,
  addWarning,
  addError,
  addWarnings,
  addErrors
} from './state';

// Re-export utility functions
export {
  getNodesByType,
  getTokenTypeName,
  getNodeTypeName,
  getUnionTypeName,
  getElementType,
  generateFileHeader,
  generateJSDoc,
  validateGeneratedCode
} from './utils';

// Re-export generators
export {
  generateTokenTypes,
  generateDeductionNodes,
  generateUnionTypes,
  generateConstants,
  generateIndexFile
} from './generators';

// Re-export main generation function
export { generate } from './core-generator';

// Re-export main convenience function
import type { BNFModel } from '../types';
import type { GenerationConfig, GenerationResult, SchemaGenerationOptions } from './types';
import { createSchemaGenerator } from './state';
import { generate } from './core-generator';

/**
 * Convenience function to generate schema files (functional version)
 */
export const generateCode = (
  model: BNFModel,
  config: GenerationConfig,
  options: SchemaGenerationOptions = {}
): GenerationResult => {
  const state = createSchemaGenerator(model, config, options);
  return generate(state);
};
