/**
 * State management utilities for stringifier generator
 */

import type { BNFModel } from '../types';
import type { StringifierConfig, StringifierGeneratorState } from './types';

/**
 * Create a new StringifierGeneratorState
 */
export const createStringifierGenerator = (
  model: BNFModel,
  config: StringifierConfig = {}
): StringifierGeneratorState => ({
  model,
  config: {
    functionPrefix: 'stringifier',
    indentStyle: '  ',
    includeWhitespace: true,
    includeFormatting: true,
    ...config,
  },
  warnings: [],
  errors: []
});

/**
 * Reset internal state (return new state with cleared warnings/errors)
 */
export const reset = (state: StringifierGeneratorState): StringifierGeneratorState => ({
  ...state,
  warnings: [],
  errors: []
});

/**
 * Validate the BNF model before generation
 */
export const validateModel = (state: StringifierGeneratorState): {
  success: boolean;
  errors?: string[];
  state: StringifierGeneratorState;
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
      errors,
      state: { ...state, errors: [...state.errors, ...errors] }
    };
  }

  return { success: true, state };
};
