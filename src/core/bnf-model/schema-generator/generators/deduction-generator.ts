/**
 * Deduction node generation functions
 */

import type { DeductionNode } from '../../types';
import type { SchemaGeneratorState } from '../types';
import { 
  getNodesByType, 
  getNodeTypeName, 
  getElementType,
  generateFileHeader, 
  generateJSDoc 
} from '../utils';
import { addFile, addWarning } from '../state';

/**
 * Generate TypeScript interfaces for deduction nodes
 */
export const generateDeductionNodes = (state: SchemaGeneratorState): SchemaGeneratorState => {
  const deductionNodes = getNodesByType(state, 'deduction') as Array<[string, DeductionNode]>;

  if (deductionNodes.length === 0) {
    return addWarning(state, 'No deduction nodes found in BNF model');
  }

  if (state.config.separateFiles) {
    // Generate separate file for each deduction node
    let currentState = state;
    for (const [name, node] of deductionNodes) {
      currentState = generateDeductionNodeFile(currentState, name, node);
    }
    return currentState;
  } else {
    // Generate single file with all deduction nodes
    return generateAllDeductionNodesFile(state, deductionNodes);
  }
};

/**
 * Generate a separate file for a single deduction node
 */
export const generateDeductionNodeFile = (
  state: SchemaGeneratorState,
  name: string,
  node: DeductionNode
): SchemaGeneratorState => {
  const imports = generateDeductionNodeImports(state, node);
  const interface_ = generateDeductionNodeInterface(state, name, node);

  const content = [
    generateFileHeader(state, `${name} node definition`),
    ...imports,
    '',
    interface_,
  ].join('\n');

  return addFile(state, `nodes/${name}.ts`, content);
};

/**
 * Generate imports needed for a deduction node
 */
export const generateDeductionNodeImports = (
  state: SchemaGeneratorState,
  node: DeductionNode
): string[] => {
  const unionImports = new Set<string>();
  const tokenImports = new Set<string>();
  const nodeImports = new Set<string>();

  for (const element of node.sequence) {
    // Only process elements that have 'prop' - these become interface properties
    if (typeof element === 'object' && element.prop && element.node) {
      const referencedNode = state.model.nodes[element.node];
      if (referencedNode?.type === 'token') {
        tokenImports.add(getElementType(state, element.node));
      } else if (referencedNode?.type === 'union') {
        unionImports.add(getElementType(state, element.node));
      } else if (referencedNode?.type === 'deduction') {
        nodeImports.add(getElementType(state, element.node));
      }
    }
    // Note: String references and object references without 'prop' 
    // don't become interface properties, so we don't need to import them
  }

  const importLines: string[] = [];

  if (tokenImports.size > 0) {
    importLines.push(`import type { ${Array.from(tokenImports).join(', ')} } from '../token-types.js';`);
  }

  if (unionImports.size > 0) {
    importLines.push(`import type { ${Array.from(unionImports).join(', ')} } from '../union-types.js';`);
  }

  // For deduction nodes, we need to import from sibling files
  for (const nodeType of nodeImports) {
    // Find the original node name for this type
    let originalName = '';
    for (const [name] of getNodesByType(state, 'deduction')) {
      if (getNodeTypeName(state, name) === nodeType) {
        originalName = name;
        break;
      }
    }
    if (originalName) {
      importLines.push(`import type { ${nodeType} } from './${originalName}.js';`);
    }
  }

  return importLines;
};

/**
 * Generate TypeScript interface for a deduction node
 */
export const generateDeductionNodeInterface = (
  state: SchemaGeneratorState,
  name: string,
  node: DeductionNode
): string => {
  const typeName = getNodeTypeName(state, name);
  const properties: string[] = [];

  // Add type discriminator
  properties.push(`readonly type: '${name}';`);

  // Generate properties from sequence elements
  for (const element of node.sequence) {
    if (typeof element === 'object' && element.prop) {
      const propType = getElementType(state, element.node);
      properties.push(`readonly ${element.prop}: ${propType};`);
    }
  }

  const docs = state.config.includeDocumentation
    ? generateJSDoc(state, node.description, {
      precedence: node.precedence,
      associativity: node.associativity,
    })
    : '';

  return `${docs}${docs ? '\n' : ''}export interface ${typeName} {
  ${properties.join('\n  ')}
}`;
};

/**
 * Generate single file with all deduction nodes
 */
export const generateAllDeductionNodesFile = (
  state: SchemaGeneratorState,
  nodes: Array<[string, DeductionNode]>
): SchemaGeneratorState => {
  // Implementation for single file approach
  // This is left as a future enhancement
  return addWarning(state, 'Single file mode for deduction nodes not yet implemented');
};
