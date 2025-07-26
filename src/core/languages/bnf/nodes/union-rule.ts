/**
 * UnionRule node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T03:15:19.145Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { UnionMemberListNode } from './union-member-list.js';

/**
 * Union rule with alternative choices
 *
 */
export interface UnionRuleNode {
  readonly type: 'UnionRule';
  readonly members: UnionMemberListNode;
}