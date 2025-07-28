/**
 * RuleList node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { RuleNode } from './Rule.js';

/**
 * List of grammar rules
 *
 */
export interface RuleListNode {
  readonly type: 'RuleList';
  readonly rules: RuleNode;
}