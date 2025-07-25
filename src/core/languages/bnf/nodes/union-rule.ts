/**
 * UnionRule node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-25T09:51:40.600Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { UnionMemberListNode } from './union-member-list.js';

export interface UnionRuleNode {
  readonly type: 'UnionRule';
  readonly members: UnionMemberListNode;
}