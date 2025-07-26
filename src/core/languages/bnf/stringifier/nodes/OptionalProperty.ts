/**
 * Stringifier for OptionalProperty node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { IdentifierToken, OptionalPropertyNode } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier OptionalProperty deduction node
 * Optional property assignment
 */
export function stringifyOptionalProperty(node: OptionalPropertyNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: PropertyOperator
  parts.push(stringifyNode(node, options));
  // Property: name (Identifier)
  if (node.name) {
    parts.push(stringifyNode(node.name, options));
  }

  return parts.join('');
}