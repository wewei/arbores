/**
 * List node generation functions
 */

import type { ListNode } from '../../types';
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
 * Generate TypeScript interfaces for list nodes
 */
export const generateListNodes = (state: SchemaGeneratorState): SchemaGeneratorState => {
  const listNodes = getNodesByType(state, 'list') as Array<[string, ListNode]>;

  if (listNodes.length === 0) {
    return state; // No warning needed - lists are optional
  }

  if (true) { // Always generate separate files
    // Generate separate file for each list node
    let currentState = state;
    for (const [name, node] of listNodes) {
      currentState = generateListNodeFile(currentState, name, node);
    }
    return currentState;
  } else {
    // Generate single file with all list nodes
    return generateAllListNodesFile(state, listNodes);
  }
};

/**
 * Generate a separate file for a single list node
 */
export const generateListNodeFile = (
  state: SchemaGeneratorState,
  name: string,
  node: ListNode
): SchemaGeneratorState => {
  const imports = generateListNodeImports(state, node);
  const interface_ = generateListNodeInterface(state, name, node);

  const content = [
    generateFileHeader(state, `${name} list node definition`),
    ...imports,
    '',
    interface_,
  ].join('\n');

  return addFile(state, `nodes/${name}.ts`, content);
};

/**
 * Generate imports needed for a list node
 */
export const generateListNodeImports = (
  state: SchemaGeneratorState,
  node: ListNode
): string[] => {
  const imports = new Set<string>();
  const importLines: string[] = [];

  // Import the item type
  const itemNode = state.model.nodes[node.item];
  if (itemNode) {
    const itemType = getElementType(state, node.item);

    if (itemNode.type === 'token') {
      imports.add(itemType);
    } else if (itemNode.type === 'union') {
      // Union types will be imported from union-types.ts
      importLines.push(`import type { ${itemType} } from '../union-types.js';`);
    } else if (itemNode.type === 'deduction' || itemNode.type === 'list') {
      // Node types will be imported from sibling files
      importLines.push(`import type { ${itemType} } from './${node.item}.js';`);
    }
  }

  // Import the separator type if it exists
  if (node.separator) {
    const separatorNode = state.model.nodes[node.separator.node];
    if (separatorNode) {
      const separatorType = getElementType(state, node.separator.node);

      if (separatorNode.type === 'token') {
        imports.add(separatorType);
      } else if (separatorNode.type === 'union') {
        if (!importLines.some(line => line.includes('union-types.js'))) {
          importLines.push(`import type { ${separatorType} } from '../union-types.js';`);
        }
      } else if (separatorNode.type === 'deduction' || separatorNode.type === 'list') {
        importLines.push(`import type { ${separatorType} } from './${node.separator.node}.js';`);
      }
    }
  }

  // Add token imports if any
  if (imports.size > 0) {
    importLines.unshift(`import type { ${Array.from(imports).join(', ')} } from '../token-types.js';`);
  }

  return importLines;
};

/**
 * Generate TypeScript interface for a list node
 */
export const generateListNodeInterface = (
  state: SchemaGeneratorState,
  name: string,
  node: ListNode
): string => {
  const typeName = getNodeTypeName(state, name);
  const properties: string[] = [];

  // Add type discriminator
  properties.push(`readonly type: '${name}';`);

  // Add items property (array of the item type)
  const itemType = getElementType(state, node.item);
  properties.push(`readonly items: ${itemType}[];`);

  // Add separators property if separator is defined
  if (node.separator) {
    const separatorType = getElementType(state, node.separator.node);

    // The separator array length depends on the 'last' setting
    switch (node.separator.last) {
      case 'required':
        // Same number of separators as items
        properties.push(`readonly separators: ${separatorType}[];`);
        break;
      case 'optional':
        // Up to the same number of separators as items
        properties.push(`readonly separators: ${separatorType}[];`);
        break;
      case 'none':
        // One fewer separator than items
        properties.push(`readonly separators: ${separatorType}[];`);
        break;
    }
  }

  const docs = true // Always include documentation
    ? generateJSDoc(state, node.description, {
      item: node.item,
      separator: node.separator?.node,
      separatorBehavior: node.separator?.last,
    })
    : '';

  return `${docs}${docs ? '\n' : ''}export interface ${typeName} {
  ${properties.join('\n  ')}
}`;
};

/**
 * Generate single file with all list nodes
 */
export const generateAllListNodesFile = (
  state: SchemaGeneratorState,
  nodes: Array<[string, ListNode]>
): SchemaGeneratorState => {
  // Implementation for single file approach
  // This is left as a future enhancement
  return addWarning(state, 'Single file mode for list nodes not yet implemented');
};
