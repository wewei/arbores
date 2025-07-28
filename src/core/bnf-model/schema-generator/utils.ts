/**
 * Utility functions for Schema Generator (Functional Version)
 * 
 * Pure utility functions for schema generation.
 */

import type { BNFModel, BNFNode, TokenNode, DeductionNode, UnionNode } from '../types';
import type { SchemaGeneratorState } from './types';

/**
 * Get nodes by type from the model
 */
export const getNodesByType = (
  state: SchemaGeneratorState,
  type: BNFNode['type']
): Array<[string, BNFNode]> => {
  return Object.entries(state.model.nodes).filter(([, node]) => node.type === type);
};

/**
 * Get token type name with suffix
 */
export const getTokenTypeName = (state: SchemaGeneratorState, name: string): string => {
  return `${name}${state.config.naming?.tokenSuffix || 'Token'}`;
};

/**
 * Get node type name with suffix
 */
export const getNodeTypeName = (state: SchemaGeneratorState, name: string): string => {
  return `${name}${state.config.naming?.nodeSuffix || 'Node'}`;
};

/**
 * Get union type name (keeps original name)
 */
export const getUnionTypeName = (state: SchemaGeneratorState, name: string): string => {
  return name; // Union types keep their original name
};

/**
 * Get element type for a node name
 */
export const getElementType = (state: SchemaGeneratorState, nodeName: string): string => {
  const node = state.model.nodes[nodeName];
  if (!node) return 'unknown';

  switch (node.type) {
    case 'token':
      return getTokenTypeName(state, nodeName);
    case 'deduction':
      return getNodeTypeName(state, nodeName);
    case 'union':
      return getUnionTypeName(state, nodeName);
    case 'list':
      return getNodeTypeName(state, nodeName);
    default:
      return 'unknown';
  }
};

/**
 * Generate file header with metadata
 */
export const generateFileHeader = (
  state: SchemaGeneratorState,
  description: string
): string => {
  return `/**
 * ${description}
 * 
 * Generated from BNF model: ${state.model.name} v${state.model.version}
 * Generation time: ${new Date().toISOString()}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`;
};

/**
 * Generate JSDoc comment
 */
export const generateJSDoc = (
  state: SchemaGeneratorState,
  description: string,
  metadata?: Record<string, any>
): string => {
  if (!state.config.includeDocumentation) return '';

  const lines = [`/**`, ` * ${description}`];

  if (metadata) {
    lines.push(' *');
    for (const [key, value] of Object.entries(metadata)) {
      if (value !== undefined && value !== null) {
        lines.push(` * @${key} ${value}`);
      }
    }
  }

  lines.push(' */');
  return lines.join('\n');
};

/**
 * Convert string to kebab-case
 * @deprecated No longer used - file names now match node names exactly
 */
export const kebabCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
};

/**
 * Basic TypeScript syntax validation
 */
export const validateTypeScriptSyntax = (content: string, filePath: string): string[] => {
  const errors: string[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() || '';
    const lineNum = i + 1;

    // Check for missing semicolons in interface properties
    if (line.includes('readonly') && !line.includes(';') && !line.includes('{') && line.length > 0) {
      errors.push(`${filePath}:${lineNum}: Missing semicolon in interface property`);
    }

    // Check for invalid type syntax
    if (line.includes('export type') && !line.includes('=')) {
      errors.push(`${filePath}:${lineNum}: Invalid type definition syntax`);
    }
  }

  return errors;
};

/**
 * Validate the generated TypeScript code for syntax and type correctness
 */
export const validateGeneratedCode = (state: SchemaGeneratorState): string[] => {
  const errors: string[] = [];

  // Basic syntax validation (simplified)
  for (const [path, content] of state.files) {
    try {
      const syntaxErrors = validateTypeScriptSyntax(content, path);
      errors.push(...syntaxErrors);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`${path}: Validation error - ${errorMsg}`);
    }
  }

  return errors;
};
