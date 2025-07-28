/**
 * Index file generation functions
 */

import type { SchemaGeneratorState } from '../types';
import {
  getNodesByType,
  generateFileHeader
} from '../utils';
import { addFile } from '../state';

/**
 * Generate index file that exports everything
 */
export const generateIndexFile = (state: SchemaGeneratorState): SchemaGeneratorState => {
  const exports: string[] = [];

  // Export token types
  exports.push("export * from './token-types.js';");

  // Export union types
  if (getNodesByType(state, 'union').length > 0) {
    exports.push("export * from './union-types.js';");
  }

  // Export deduction nodes
  const deductionNodes = getNodesByType(state, 'deduction');
  if (state.config.separateFiles && deductionNodes.length > 0) {
    for (const [name] of deductionNodes) {
      exports.push(`export * from './nodes/${name}.js';`);
    }
  }

  // Export list nodes
  const listNodes = getNodesByType(state, 'list');
  if (state.config.separateFiles && listNodes.length > 0) {
    for (const [name] of listNodes) {
      exports.push(`export * from './nodes/${name}.js';`);
    }
  }

  // Export constants
  exports.push("export * from './constants.js';");

  const content = [
    generateFileHeader(state, `${state.model.name} grammar type definitions`),
    ...exports,
  ].join('\n');

  return addFile(state, 'index.ts', content);
};
