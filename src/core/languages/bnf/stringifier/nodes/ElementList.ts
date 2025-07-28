/**
 * Stringifier for ElementList node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:54:52.611Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { ElementListNode, ElementNode } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';
import { getIndentation, addWhitespace, formatToken } from '../utils';

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