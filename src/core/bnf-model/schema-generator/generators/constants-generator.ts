/**
 * Constants and registry generation functions
 */

import type { TokenNode, DeductionNode } from '../../types';
import type { SchemaGeneratorState } from '../types';
import { 
  getNodesByType,
  generateFileHeader 
} from '../utils';
import { addFile } from '../state';

/**
 * Generate constants registry file
 */
export const generateConstants = (state: SchemaGeneratorState): SchemaGeneratorState => {
  const tokenNodes = getNodesByType(state, 'token') as Array<[string, TokenNode]>;
  const deductionNodes = getNodesByType(state, 'deduction') as Array<[string, DeductionNode]>;

  const constants: string[] = [];

  // Token pattern registry
  constants.push('/**');
  constants.push(' * Token pattern registry for the grammar');
  constants.push(' */');
  constants.push('export const TOKEN_PATTERNS = {');

  for (const [name, node] of tokenNodes) {
    let pattern: string;
    if (typeof node.pattern === 'string') {
      // Escape single quotes in string literals
      const escapedPattern = node.pattern.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      pattern = `'${escapedPattern}'`;
    } else {
      // Escape single quotes and backslashes in regex patterns
      const escapedRegex = node.pattern.regex.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      pattern = `{ regex: '${escapedRegex}' }`;
    }
    constants.push(`  ${name}: ${pattern},`);
  }
  constants.push('} as const;');
  constants.push('');

  // Precedence registry
  const precedenceNodes = deductionNodes.filter(([, node]) => node.precedence !== undefined);
  if (precedenceNodes.length > 0) {
    constants.push('/**');
    constants.push(' * Precedence registry for deduction rules');
    constants.push(' */');
    constants.push('export const PRECEDENCE = {');

    for (const [name, node] of precedenceNodes) {
      constants.push(`  ${name}: ${node.precedence},`);
    }
    constants.push('} as const;');
    constants.push('');
  }

  // Associativity registry
  const associativityNodes = deductionNodes.filter(([, node]) => node.associativity !== undefined);
  if (associativityNodes.length > 0) {
    constants.push('/**');
    constants.push(' * Associativity registry for deduction rules');
    constants.push(' */');
    constants.push('export const ASSOCIATIVITY = {');

    for (const [name, node] of associativityNodes) {
      constants.push(`  ${name}: '${node.associativity}',`);
    }
    constants.push('} as const;');
  }

  const content = [
    generateFileHeader(state, 'Constants and registries'),
    ...constants,
  ].join('\n');

  return addFile(state, 'constants.ts', content);
};
