/**
 * DeductionRule node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.643Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { ElementListNode } from './element-list.js';

/**
 * Deduction rule with sequence of elements
 *
 */
export interface DeductionRuleNode {
  readonly type: 'DeductionRule';
  readonly sequence: ElementListNode;
}