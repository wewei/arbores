/**
 * Grammar node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { HeaderNode } from './Header.js';
import type { RuleListNode } from './RuleList.js';

/**
 * Complete BNF grammar definition
 *
 */
export interface GrammarNode {
  readonly type: 'Grammar';
  readonly header: HeaderNode;
  readonly rules: RuleListNode;
}