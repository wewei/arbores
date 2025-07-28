/**
 * Stringifier for DeductionRule node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.934Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { DeductionRuleNode, ElementListNode } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';
import { getIndentation, addWhitespace, formatToken } from '../utils';

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