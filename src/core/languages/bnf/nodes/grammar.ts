/**
 * Grammar node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-25T09:51:40.599Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { HeaderNode } from './header.js';
import type { RuleListNode } from './rule-list.js';

export interface GrammarNode {
  readonly type: 'Grammar';
  readonly header: HeaderNode;
  readonly rules: RuleListNode;
}