/**
 * Stringifier for OptionalProperty node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { IdentifierToken, OptionalPropertyNode } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';
import { getIndentation, addWhitespace, formatToken } from '../utils';

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