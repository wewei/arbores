/**
 * Utility functions for stringifier generator
 */

import type { BNFModel, BNFNode, DeductionNode } from '../types';
import type { StringifierGeneratorState } from './types';

/**
 * Get unique node types from the model
 */
export const getUniqueNodeTypes = (state: StringifierGeneratorState): string[] => {
  const types = new Set<string>();

  for (const nodeName of Object.keys(state.model.nodes)) {
    types.add(getNodeTypeName(state, nodeName));
  }

  return Array.from(types).sort();
};

/**
 * Get the TypeScript type name for a node
 */
export const getNodeTypeName = (state: StringifierGeneratorState, nodeName: string): string => {
  const node = state.model.nodes[nodeName];
  if (!node) return 'unknown';

  // Use custom type mapping if provided
  if (state.config.typeMapping?.[nodeName]) {
    return state.config.typeMapping[nodeName];
  }

  // Default naming convention based on node type
  switch (node.type) {
    case 'token':
      return `${nodeName}Token`;
    case 'deduction':
      return `${nodeName}Node`;
    case 'union':
      return nodeName;
    default:
      return nodeName;
  }
};

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get the types required for a specific node
 */
export const getRequiredTypesForNode = (
  state: StringifierGeneratorState,
  nodeName: string,
  node: BNFNode
): string[] => {
  const types = new Set<string>();
  
  // Always include the node's own type
  types.add(getNodeTypeName(state, nodeName));

  // For deduction nodes, include types of referenced properties
  if (node.type === 'deduction') {
    const deductionNode = node as DeductionNode;
    for (const element of deductionNode.sequence) {
      if (typeof element === 'object' && element.prop) {
        const referencedNodeType = getNodeTypeName(state, element.node);
        types.add(referencedNodeType);
      }
    }
  }

  return Array.from(types).sort();
};
