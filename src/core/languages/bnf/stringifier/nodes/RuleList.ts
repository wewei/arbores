/**
 * Stringifier for RuleList node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { RuleListNode, RuleNode } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier RuleList deduction node
 * List of grammar rules
 */
export function stringifyRuleList(node: RuleListNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: rules (Rule)
  if (node.rules) {
    parts.push(stringifyNode(node.rules, options));
  }

  return parts.join('');
}