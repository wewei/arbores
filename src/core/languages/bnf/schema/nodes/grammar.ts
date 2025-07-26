/**
 * Grammar node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.642Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { HeaderNode } from './header.js';
import type { RuleListNode } from './rule-list.js';

/**
 * Complete BNF grammar definition
 *
 */
export interface GrammarNode {
  readonly type: 'Grammar';
  readonly header: HeaderNode;
  readonly rules: RuleListNode;
}