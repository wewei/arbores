/**
 * Stringifier for UnionRule node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { UnionMemberListNode, UnionRuleNode } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';
import { getIndentation, addWhitespace, formatToken } from '../utils';

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