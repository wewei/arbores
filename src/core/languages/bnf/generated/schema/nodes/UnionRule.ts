/**
 * UnionRule node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
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