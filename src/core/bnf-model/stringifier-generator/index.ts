/**
 * BNF Model Stringifier Generator (Modular Functional Version)
 * 
 * Main entry point for the stringifier generator.
 * Generates recursive code stringification functions from BNF models using pure functions.
 */

// Re-export types
export type {
  StringifierConfig,
  StringifierOptions,
  StringifierGenerationResult,
  StringifierGeneratorState
} from './types';

// Re-export state management
export {
  createStringifierGenerator,
  reset,
  validateModel
} from './state';

// Re-export main generation function
export {
  generate
} from './core-generator';

// Re-export main convenience function
import type { BNFModel } from '../types';
import type { StringifierConfig, StringifierGenerationResult } from './types';
import { createStringifierGenerator } from './state';
import { generate } from './core-generator';

/**
 * Convenience function to generate stringifier functions (functional version)
 */
export const generateStringifierFunctions = (
  model: BNFModel,
  config: StringifierConfig = {}
): StringifierGenerationResult => {
  const state = createStringifierGenerator(model, config);
  return generate(state);
};
