/**
 * RuleList node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T09:37:45.220Z
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