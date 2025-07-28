/**
 * BNF Model Schema Generator
 * 
 * Re-exports from the functional schema generator with backward compatibility.
 * This file maintains backward compatibility with the original class-based API.
 */

// Re-export everything from the functional version
export * from './schema-generator/index';

// Backward compatibility: provide the original class-based API
import type { BNFModel } from './types';
import type { GenerationConfig, GenerationResult } from './schema-generator/types';
import { generateCode as functionalGenerateCode } from './schema-generator/index';

/**
 * @deprecated Use the functional generateCode function instead
 * Backward compatible class wrapper around the functional implementation
 */
export class BNFCodeGenerator {
  private model: BNFModel;
  private config: GenerationConfig;

  constructor(model: BNFModel, config: GenerationConfig) {
    this.model = model;
    this.config = config;
  }

  /**
   * Generate all code files from the BNF model
   * @deprecated Use the functional generateCode function instead
   */
  public generate(): GenerationResult {
    return functionalGenerateCode(this.model, this.config);
  }
}
