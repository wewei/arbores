/**
 * Header and import generation functions
 */

import { createHash } from 'crypto';
import type { BNFModel, BNFNode } from '../../types';
import type { StringifierGeneratorState } from '../types';
import { getUniqueNodeTypes } from '../utils';

/**
 * Calculate SHA256 hash of BNF model for stable versioning
 */
const calculateModelHash = (model: BNFModel): string => {
  // Create a stable, deterministic representation of the model
  const normalizedModel = {
    name: model.name,
    version: model.version,
    start: model.start,
    nodes: Object.keys(model.nodes)
      .sort() // Ensure consistent ordering
      .reduce((sorted, key) => {
        const node = model.nodes[key];
        if (node) {
          sorted[key] = node;
        }
        return sorted;
      }, {} as Record<string, BNFNode>)
  };

  // Convert to JSON with consistent formatting
  const modelJson = JSON.stringify(normalizedModel, null, 2);

  // Calculate SHA256 hash
  return createHash('sha256').update(modelJson, 'utf8').digest('hex').substring(0, 12);
};

/**
 * Generate file header with metadata
 */
export const generateFileHeader = (state: StringifierGeneratorState): string => {
  const modelHash = calculateModelHash(state.model);
  return `/**
 * stringifier functions for ${state.model.name} grammar
 * 
 * Generated from BNF model: ${state.model.name} v${state.model.version}
 * Model hash: ${modelHash}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`;
};

/**
 * Generate simple file header for individual node files
 */
export const generateSimpleFileHeader = (state: StringifierGeneratorState, description: string): string => {
  const modelHash = calculateModelHash(state.model);
  return `/**
 * ${description}
 * 
 * Generated from BNF model: ${state.model.name} v${state.model.version}
 * Model hash: ${modelHash}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`;
};

/**
 * Generate import statements
 */
export const generateImports = (state: StringifierGeneratorState): string => {
  const imports: string[] = [];

  // Import node types
  const nodeTypes = getUniqueNodeTypes(state);
  if (nodeTypes.length > 0) {
    imports.push(`import type { ${nodeTypes.join(', ')} } from '../schema/index';`);
  }

  return imports.join('\n');
};

/**
 * Generate StringifierOptions type definition for the output file
 */
export const generateStringifierOptionsType = (): string => {
  return `/**
 * Options for stringifier functions
 */
export interface StringifierOptions {
  /** Current indentation level */
  indent?: number;
  /** Indentation string (spaces or tabs) */
  indentString?: string;
  /** Whether to include whitespace */
  includeWhitespace?: boolean;
  /** Whether to format output */
  format?: boolean;
  /** Custom formatting rules */
  formatting?: {
    /** Insert newlines after certain tokens */
    newlineAfter?: string[];
    /** Insert spaces around certain tokens */
    spaceAround?: string[];
    /** Compact mode (minimal whitespace) */
    compact?: boolean;
  };
}`;
};
