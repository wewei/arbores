/**
 * Node-specific stringifier function generation
 */

import type { BNFNode, TokenNode, DeductionNode, UnionNode, ListNode } from '../../types';
import type { StringifierGeneratorState } from '../types';
import { getNodeTypeName } from '../utils';

/**
 * Generate stringifier function for a specific node
 */
export const generateNodeStringifierFunction = (
  state: StringifierGeneratorState,
  nodeName: string,
  node: BNFNode
): string => {
  const functionName = `${state.config.functionPrefix}${nodeName}`;
  const nodeType = getNodeTypeName(state, nodeName);

  switch (node.type) {
    case 'token':
      return generateTokenStringifierFunction(state, functionName, nodeName, nodeType, node as TokenNode);
    case 'deduction':
      return generateDeductionStringifierFunction(state, functionName, nodeName, nodeType, node as DeductionNode);
    case 'union':
      return generateUnionStringifierFunction(state, functionName, nodeName, nodeType, node as UnionNode);
    case 'list':
      return generateListStringifierFunction(state, functionName, nodeName, nodeType, node as ListNode);
    default:
      // Return updated state with error - but for now just return empty string
      return '';
  }
};

/**
 * Generate stringifier function for a token node
 */
export const generateTokenStringifierFunction = (
  state: StringifierGeneratorState,
  functionName: string,
  nodeName: string,
  nodeType: string,
  node: TokenNode
): string => {
  return `/**
 * stringifier ${nodeName} token
 * ${node.description}
 */
export function ${functionName}(node: ${nodeType}, options: StringifierOptions): string {
  return node.value;
}`;
};

/**
 * Generate stringifier function for a deduction node
 */
export const generateDeductionStringifierFunction = (
  state: StringifierGeneratorState,
  functionName: string,
  nodeName: string,
  nodeType: string,
  node: DeductionNode
): string => {
  const sequenceCode = generateSequenceStringification(state, node);

  return `/**
 * stringifier ${nodeName} deduction node
 * ${node.description}
 */
export function ${functionName}(node: ${nodeType}, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
${sequenceCode}

  return parts.join('');
}`;
};

/**
 * Generate stringifier function for a union node
 */
export const generateUnionStringifierFunction = (
  state: StringifierGeneratorState,
  functionName: string,
  nodeName: string,
  nodeType: string,
  node: UnionNode
): string => {
  return `/**
 * stringifier ${nodeName} union node
 * ${node.description}
 */
export function ${functionName}(node: ${nodeType}, options: StringifierOptions): string {
  // Union nodes delegate to their actual type
  return stringifyNode(node, options);
}`;
};

/**
 * Generate sequence stringification logic for deduction nodes
 */
export const generateSequenceStringification = (
  state: StringifierGeneratorState,
  node: DeductionNode
): string => {
  const parts: string[] = [];

  for (let i = 0; i < node.sequence.length; i++) {
    const element = node.sequence[i];

    if (typeof element === 'string') {
      // String reference to token
      const referencedNode = state.model.nodes[element];
      if (referencedNode?.type === 'token') {
        parts.push(`  // Token reference: ${element}`);
        parts.push(`  parts.push(stringifyNode(node, options));`);
      }
    } else if (typeof element === 'object' && element.prop) {
      // Property reference
      const referencedNode = state.model.nodes[element.node];
      if (referencedNode) {
        parts.push(`  // Property: ${element.prop} (${element.node})`);
        parts.push(`  if (node.${element.prop}) {`);
        parts.push(`    parts.push(stringifyNode(node.${element.prop}, options));`);
        parts.push(`  }`);

        // Add formatting logic
        if (state.config.includeFormatting && i < node.sequence.length - 1) {
          parts.push(`  if (options.format && options.includeWhitespace) {`);
          parts.push(`    parts.push(' ');`);
          parts.push(`  }`);
        }
      }
    }
  }

  return parts.join('\n');
};

/**
 * Generate stringifier function for a list node
 */
export const generateListStringifierFunction = (
  state: StringifierGeneratorState,
  functionName: string,
  nodeName: string,
  nodeType: string,
  node: ListNode
): string => {
  return `/**
 * stringifier ${nodeName} list node
 * ${node.description}
 */
export function ${functionName}(node: ${nodeType}, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Stringify items with separators
  for (let i = 0; i < node.items.length; i++) {
    // Add the item
    parts.push(stringifyNode(node.items[i], options));
    
    // Add separator if it exists and is needed
    if (node.separators && i < node.separators.length) {
      ${node.separator?.last === 'none'
      ? '// Only add separator if not the last item\n      if (i < node.items.length - 1) {'
      : '// Add separator'
    }
      ${node.separator?.last === 'none' ? '  ' : ''}parts.push(stringifyNode(node.separators[i], options));
      ${node.separator?.last === 'none' ? '      }' : ''}
    }
  }

  return parts.join('');
}`;
};
