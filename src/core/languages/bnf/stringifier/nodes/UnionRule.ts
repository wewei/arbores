/**
 * Stringifier for UnionRule node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { UnionMemberListNode, UnionRuleNode } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier UnionRule deduction node
 * Union rule with alternative choices
 */
export function stringifyUnionRule(node: UnionRuleNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: members (UnionMemberList)
  if (node.members) {
    parts.push(stringifyNode(node.members, options));
  }

  return parts.join('');
}