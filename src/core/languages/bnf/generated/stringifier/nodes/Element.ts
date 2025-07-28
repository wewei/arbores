/**
 * Stringifier for Element node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { ElementNode, IdentifierToken, OptionalPropertyNode } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';
import { getIndentation, addWhitespace, formatToken } from '../utils';

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