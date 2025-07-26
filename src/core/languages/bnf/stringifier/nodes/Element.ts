/**
 * Stringifier for Element node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { ElementNode, IdentifierToken, OptionalPropertyNode } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier Element deduction node
 * Single element in a sequence
 */
export function stringifyElement(node: ElementNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: node (Identifier)
  if (node.node) {
    parts.push(stringifyNode(node.node, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: property (OptionalProperty)
  if (node.property) {
    parts.push(stringifyNode(node.property, options));
  }

  return parts.join('');
}