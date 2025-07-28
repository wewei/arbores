/**
 * State management for Schema Generator (Functional Version)
 * 
 * Pure functions for managing schema generator state.
 */

import type { BNFModel } from '../types';
import type { 
  SchemaGeneratorState, 
  GenerationConfig, 
  SchemaGenerationOptions 
} from './types';

/**
 * Create initial schema generator state
 */
export const createSchemaGenerator = (
  model: BNFModel,
  config: GenerationConfig,
  options: SchemaGenerationOptions = {}
): SchemaGeneratorState => {
  const mergedConfig: GenerationConfig = {
    separateFiles: true,
    includeDocumentation: true,
    naming: {
      tokenSuffix: 'Token',
      nodeSuffix: 'Node',
    },
    ...config,
  };

  return {
    model,
    config: mergedConfig,
    files: new Map(),
    warnings: [],
    errors: [],
  };
};

/**
 * Reset schema generator state (create fresh state)
 */
export const reset = (state: SchemaGeneratorState): SchemaGeneratorState => ({
  ...state,
  files: new Map(),
  warnings: [],
  errors: [],
});

/**
 * Add a file to the generator state
 */
export const addFile = (
  state: SchemaGeneratorState,
  path: string,
  content: string
): SchemaGeneratorState => {
  const newFiles = new Map(state.files);
  newFiles.set(path, content);

  return {
    ...state,
    files: newFiles,
  };
};

/**
 * Add a warning to the generator state
 */
export const addWarning = (
  state: SchemaGeneratorState,
  warning: string
): SchemaGeneratorState => ({
  ...state,
  warnings: [...state.warnings, warning],
});

/**
 * Add an error to the generator state
 */
export const addError = (
  state: SchemaGeneratorState,
  error: string
): SchemaGeneratorState => ({
  ...state,
  errors: [...state.errors, error],
});

/**
 * Add multiple warnings to the generator state
 */
export const addWarnings = (
  state: SchemaGeneratorState,
  warnings: string[]
): SchemaGeneratorState => ({
  ...state,
  warnings: [...state.warnings, ...warnings],
});

/**
 * Add multiple errors to the generator state
 */
export const addErrors = (
  state: SchemaGeneratorState,
  errors: string[]
): SchemaGeneratorState => ({
  ...state,
  errors: [...state.errors, ...errors],
});

/**
 * Validate the BNF model before generation
 */
export const validateModel = (state: SchemaGeneratorState): {
  success: boolean;
  state: SchemaGeneratorState;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!state.model.nodes || Object.keys(state.model.nodes).length === 0) {
    errors.push('BNF model must have at least one node');
  }

  if (!state.model.start || !state.model.nodes[state.model.start]) {
    errors.push('BNF model start node must exist in nodes');
  }

  if (errors.length > 0) {
    return {
      success: false,
      state: addErrors(state, errors),
      errors,
    };
  }

  return {
    success: true,
    state,
    errors: [],
  };
};
