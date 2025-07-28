/**
 * UnionRule node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:54:52.588Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { UnionMemberListNode } from './UnionMemberList.js';

/**
 * Union rule with alternative choices
 *
 */
export interface UnionRuleNode {
  readonly type: 'UnionRule';
  readonly members: UnionMemberListNode;
}