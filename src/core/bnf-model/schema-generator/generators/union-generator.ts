/**
 * Union type generation functions
 */

import type { UnionNode } from '../../types';
import type { SchemaGeneratorState } from '../types';
import {
  getNodesByType,
  getUnionTypeName,
  getTokenTypeName,
  getNodeTypeName,
  getElementType,
  generateFileHeader,
  generateJSDoc
} from '../utils';
import { addFile, addWarning } from '../state';

/**
 * Generate TypeScript union types for union nodes
 */
export const generateUnionTypes = (state: SchemaGeneratorState): SchemaGeneratorState => {
  const unionNodes = getNodesByType(state, 'union') as Array<[string, UnionNode]>;

  if (unionNodes.length === 0) {
    return addWarning(state, 'No union nodes found in BNF model');
  }

  const tokenImports = new Set<string>();
  const nodeImports = new Set<string>();
  const unionTypes: string[] = [];

  for (const [name, node] of unionNodes) {
    const typeName = getUnionTypeName(state, name);
    const memberTypes: string[] = [];

    for (const member of node.members) {
      const memberNode = state.model.nodes[member];
      if (memberNode) {
        const memberType = getElementType(state, member);
        memberTypes.push(memberType);

        // Track imports
        if (memberNode.type === 'token') {
          tokenImports.add(memberType);
        } else if (memberNode.type === 'deduction') {
          nodeImports.add(`nodes/${member}`);
        }
      }
    }

    const docs = true // Always include documentation
      ? generateJSDoc(state, node.description, { members: node.members })
      : '';

    const unionType = `${docs}${docs ? '\n' : ''}export type ${typeName} = ${memberTypes.join(' | ')};`;
    unionTypes.push(unionType);
  }

  // Generate all node types union and root type
  const allNodeTypes: string[] = [];
  const allTokenImports = new Set<string>();
  const allNodeImports = new Set<string>();

  for (const [name, node] of Object.entries(state.model.nodes)) {
    if (node.type === 'token') {
      const typeName = getTokenTypeName(state, name);
      allNodeTypes.push(typeName);
      allTokenImports.add(typeName);
    } else if (node.type === 'deduction') {
      const typeName = getNodeTypeName(state, name);
      allNodeTypes.push(typeName);
      allNodeImports.add(`nodes/${name}`);
    } else if (node.type === 'list') {
      const typeName = getNodeTypeName(state, name);
      allNodeTypes.push(typeName);
      allNodeImports.add(`nodes/${name}`);
    } else if (node.type === 'union') {
      const typeName = getUnionTypeName(state, name);
      allNodeTypes.push(typeName);
      // Union types are in the same file, no need to import
    }
  }

  const allNodeUnion = `
/**
 * Union of all node types in the ${state.model.name} grammar
 */
export type ${state.model.name}Node = ${allNodeTypes.join(' | ')};

/**
 * The root node type for the grammar
 */
export type ${state.model.name}Root = ${getElementType(state, state.model.start)};`;

  // Generate import statements
  const importLines: string[] = [];

  // Combine token imports from unions and all nodes
  const combinedTokenImports = new Set([...tokenImports, ...allTokenImports]);
  if (combinedTokenImports.size > 0) {
    importLines.push(`import type { ${Array.from(combinedTokenImports).join(', ')} } from './token-types.js';`);
  }

  // Combine node imports from unions and all nodes
  const combinedNodeImports = new Set([...nodeImports, ...allNodeImports]);
  for (const nodeImport of combinedNodeImports) {
    const nodeName = nodeImport.replace('nodes/', '');
    const nodeTypeName = getNodeTypeName(state, nodeName);
    importLines.push(`import type { ${nodeTypeName} } from './${nodeImport}.js';`);
  }

  const content = [
    generateFileHeader(state, 'Union type definitions'),
    ...importLines,
    '',
    ...unionTypes,
    allNodeUnion,
  ].join('\n');

  return addFile(state, 'union-types.ts', content);
};
