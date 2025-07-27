/**
 * File generation functions for stringifier generator
 */

import type { BNFNode } from '../../types';
import type { StringifierGeneratorState } from '../types';
import { generateFileHeader, generateImports, generateStringifierOptionsType } from './header-generator';
import { generateMainFunctionType, generateMainStringifierFunction } from './main-function-generator';
import { generateNodeStringifierFunction } from './node-function-generator';
import { generateUtilityFunctions } from './utility-generator';
import { getRequiredTypesForNode } from '../utils';

/**
 * Generate stringifier files for all nodes
 */
export const generateStringifierFiles = (state: StringifierGeneratorState): {
  files: Map<string, string>;
  warnings: string[];
  errors: string[];
} => {
  const files = new Map<string, string>();
  const warnings: string[] = [];
  const errors: string[] = [];

  // Generate shared types file
  const typesContent = generateSharedTypesFile(state);
  files.set('types.ts', typesContent);

  // Generate utility functions file
  const utilsContent = generateUtilityFunctionsFile(state);
  files.set('utils.ts', utilsContent);

  // Generate individual node stringifier files in nodes/ directory
  for (const [nodeName, node] of Object.entries(state.model.nodes)) {
    const fileName = `nodes/${nodeName}.ts`;
    const content = generateNodeStringifierFile(state, nodeName, node);
    files.set(fileName, content);
  }

  // Generate main index file
  const indexContent = generateStringifierIndexFile(state);
  files.set('index.ts', indexContent);

  return { files, warnings, errors };
};

/**
 * Generate stringifier file for a single node
 */
export const generateNodeStringifierFile = (
  state: StringifierGeneratorState,
  nodeName: string,
  node: BNFNode
): string => {
  const parts: string[] = [];

  // Add file header
  parts.push(`/**
 * Stringifier for ${nodeName} node
 * 
 * Generated from BNF model: ${state.model.name} v${state.model.version}
 * Generation time: ${new Date().toISOString()}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`);
  parts.push('');

  // Add imports - only import the specific node type and any referenced types
  const requiredTypes = getRequiredTypesForNode(state, nodeName, node);
  if (requiredTypes.length > 0) {
    parts.push(`import type { ${requiredTypes.join(', ')} } from '../../schema/index';`);
  }
  
  parts.push(`import type { StringifierOptions } from '../types';`);
  
  // Import utility functions and stringifyNode if needed
  if (node.type === 'deduction' || node.type === 'union') {
    parts.push(`import { stringifyNode } from '../index';`);
  }
  
  // Import utility functions if this is a deduction node
  if (node.type === 'deduction') {
    parts.push(`import { getIndentation, addWhitespace, formatToken } from '../utils';`);
  }
  
  parts.push('');

  // Generate the node stringifier function
  parts.push(generateNodeStringifierFunction(state, nodeName, node));

  return parts.join('\n');
};

/**
 * Generate the main index file that exports all stringifiers
 */
export const generateStringifierIndexFile = (state: StringifierGeneratorState): string => {
  const parts: string[] = [];

  // Add file header
  parts.push(`/**
 * Stringifier functions for ${state.model.name} grammar
 * 
 * Generated from BNF model: ${state.model.name} v${state.model.version}
 * Generation time: ${new Date().toISOString()}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`);
  parts.push('');

  // Add imports for schema types
  parts.push(generateImports(state));
  parts.push('');
  
  // Import StringifierOptions type
  parts.push(`import type { StringifierOptions } from './types';`);
  parts.push('');

  // Add imports for all node stringifiers from nodes/ directory
  const nodeNames = Object.keys(state.model.nodes);
  for (const nodeName of nodeNames) {
    const functionName = `${state.config.functionPrefix}${nodeName}`;
    parts.push(`import { ${functionName} } from './nodes/${nodeName}';`);
  }
  parts.push('');

  // Re-export all stringifier functions
  for (const nodeName of nodeNames) {
    const functionName = `${state.config.functionPrefix}${nodeName}`;
    parts.push(`export { ${functionName} };`);
  }
  parts.push('');

  // Re-export types and utilities
  parts.push(`export type { StringifierOptions } from './types';`);
  parts.push(`export { getIndentation, addWhitespace, formatToken } from './utils';`);
  parts.push('');

  // Add main stringifier function type
  parts.push(generateMainFunctionType(state));
  parts.push('');

  // Generate main dispatch stringifier function
  parts.push(generateMainStringifierFunction(state));

  return parts.join('\n');
};

/**
 * Generate shared types file
 */
export const generateSharedTypesFile = (state: StringifierGeneratorState): string => {
  const parts: string[] = [];

  parts.push(`/**
 * Shared types for ${state.model.name} stringifier
 * 
 * Generated from BNF model: ${state.model.name} v${state.model.version}
 * Generation time: ${new Date().toISOString()}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`);
  parts.push('');

  parts.push(generateStringifierOptionsType());

  return parts.join('\n');
};

/**
 * Generate utility functions file
 */
export const generateUtilityFunctionsFile = (state: StringifierGeneratorState): string => {
  const parts: string[] = [];

  parts.push(`/**
 * Utility functions for ${state.model.name} stringifier
 * 
 * Generated from BNF model: ${state.model.name} v${state.model.version}
 * Generation time: ${new Date().toISOString()}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`);
  parts.push('');

  parts.push(`import type { StringifierOptions } from './types';`);
  parts.push('');

  parts.push(generateUtilityFunctions());

  return parts.join('\n');
};

/**
 * Merge multiple files into a single code string for backward compatibility
 */
export const mergeFilesForBackwardCompatibility = (files: Map<string, string>): string => {
  const parts: string[] = [];

  // Add main index file content (which contains the main function and utilities)
  const indexFile = files.get('index.ts');
  if (indexFile) {
    parts.push(indexFile);
  }

  return parts.join('\n');
};

/**
 * Generate type definitions (for backward compatibility)
 */
export const generateTypeDefinitions = (): string => {
  return `// Type definitions are now included in the generated code files`;
};
