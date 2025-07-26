/**
 * DeductionRule node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:02:29.782Z
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