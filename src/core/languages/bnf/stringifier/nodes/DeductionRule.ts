/**
 * Stringifier for DeductionRule node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { DeductionRuleNode, ElementListNode } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier DeductionRule deduction node
 * Deduction rule with sequence of elements
 */
export function stringifyDeductionRule(node: DeductionRuleNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: sequence (ElementList)
  if (node.sequence) {
    parts.push(stringifyNode(node.sequence, options));
  }

  return parts.join('');
}