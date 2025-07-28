/**
 * Token type generation functions
 */

import type { TokenNode } from '../../types';
import type { SchemaGeneratorState } from '../types';
import {
  getNodesByType,
  getTokenTypeName,
  generateFileHeader,
  generateJSDoc
} from '../utils';
import { addFile, addWarning } from '../state';

/**
 * Generate TypeScript type definitions for token nodes
 */
export const generateTokenTypes = (state: SchemaGeneratorState): SchemaGeneratorState => {
  const tokenNodes = getNodesByType(state, 'token') as Array<[string, TokenNode]>;

  if (tokenNodes.length === 0) {
    return addWarning(state, 'No token nodes found in BNF model');
  }

  const imports: string[] = [];
  const tokenTypes: string[] = [];
  const tokenUnion: string[] = [];

  // Generate individual token types
  for (const [name, node] of tokenNodes) {
    const typeName = getTokenTypeName(state, name);
    tokenUnion.push(typeName);

    const docs = state.config.includeDocumentation
      ? generateJSDoc(state, node.description, {
        pattern: typeof node.pattern === 'string'
          ? node.pattern
          : `regex: ${node.pattern.regex}`
      })
      : '';

    // Generate token interface
    const tokenInterface = `${docs}${docs ? '\n' : ''}export interface ${typeName} {
  readonly type: '${name}';
  readonly value: string;
}`;

    tokenTypes.push(tokenInterface);
  }

  // Generate token union type
  const tokenUnionType = `/**
 * Union of all token types in the ${state.model.name} grammar
 */
export type ${state.model.name}Token = ${tokenUnion.join(' | ')};`;

  // Generate token constants
  const tokenConstants = tokenNodes.map(([name]) =>
    `export const ${name.toUpperCase()}_TOKEN = '${name}' as const;`
  ).join('\n');

  // Combine all token definitions
  const content = [
    generateFileHeader(state, 'Token type definitions'),
    ...imports,
    '',
    ...tokenTypes,
    '',
    tokenUnionType,
    '',
    '// Token constants',
    tokenConstants,
  ].join('\n');

  return addFile(state, 'token-types.ts', content);
};
