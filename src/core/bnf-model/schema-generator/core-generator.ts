/**
 * Core generation logic for schema generator
 */

import type { SchemaGeneratorState, GenerationResult } from './types';
import { reset, validateModel, addErrors } from './state';
import { validateGeneratedCode } from './utils';
import {
  generateTokenTypes,
  generateDeductionNodes,
  generateListNodes,
  generateUnionTypes,
  generateConstants,
  generateIndexFile
} from './generators';/**
 * Generate all schema files for the BNF model
 */
export const generate = (state: SchemaGeneratorState): GenerationResult => {
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

    // Generate different types of definitions
    let currentState = validationResult.state;
    currentState = generateTokenTypes(currentState);
    currentState = generateDeductionNodes(currentState);
    currentState = generateListNodes(currentState);
    currentState = generateUnionTypes(currentState);
    currentState = generateConstants(currentState);
    currentState = generateIndexFile(currentState);

    // Validate generated code
    const codeValidationErrors = validateGeneratedCode(currentState);
    if (codeValidationErrors.length > 0) {
      currentState = addErrors(currentState, codeValidationErrors);
    }

    return {
      success: currentState.errors.length === 0,
      files: new Map(currentState.files),
      warnings: [...currentState.warnings],
      errors: [...currentState.errors],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      errors: [`Schema generation failed: ${errorMsg}`],
    };
  }
};
