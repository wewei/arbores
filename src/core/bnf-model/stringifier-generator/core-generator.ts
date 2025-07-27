/**
 * Core generation logic for stringifier generator
 */

import type { StringifierGeneratorState, StringifierGenerationResult } from './types';
import { reset, validateModel } from './state';
import { 
  generateStringifierFiles,
  mergeFilesForBackwardCompatibility,
  generateTypeDefinitions 
} from './generators';

/**
 * Generate all stringifier functions for the BNF model
 */
export const generate = (state: StringifierGeneratorState): StringifierGenerationResult => {
  try {
    // Reset state (create fresh state)
    const resetState = reset(state);

    // Validate model before generation
    const validationResult = validateModel(resetState);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.errors,
      };
    }

    // Generate files
    const filesResult = generateStringifierFiles(validationResult.state);

    // For backward compatibility, merge all files into a single code string
    const code = mergeFilesForBackwardCompatibility(filesResult.files);
    const types = generateTypeDefinitions();

    return {
      success: filesResult.errors.length === 0,
      files: filesResult.files,
      code,
      types,
      warnings: [...filesResult.warnings],
      errors: [...filesResult.errors],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      errors: [`stringifier generation failed: ${errorMsg}`],
    };
  }
};
