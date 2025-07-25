/**
 * Core Utilities Index
 * 
 * Central export point for all core utilities.
 */

// AST Processing utilities
export {
  generateNodeId,
  isTokenNode,
  extractNodeProperties,
  extractComments
} from './ast-processing.js';

// File format utilities
export {
  type ASTFileFormat,
  getFormatFromPath,
  parseASTFile,
  stringifyASTData
} from './file-format.js';

// String case conversion utilities
export {
  toCamelCase,
  toKebabCase,
  pascalCaseToCamelCase,
  pascalCaseToKebabCase
} from './string-case.js';

// AST comparison utilities
export {
  type ASTLocation,
  type ASTComparisonResult,
  compareASTNodes,
  compareSourceFileASTs,
  formatASTLocation
} from './ast-comparison.js';
