/**
 * Stringifier for ElementList node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { ElementListNode, ElementNode } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier ElementList deduction node
 * Sequence of elements in a deduction rule
 */
export function stringifyElementList(node: ElementListNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: elements (Element)
  if (node.elements) {
    parts.push(stringifyNode(node.elements, options));
  }

  return parts.join('');
}