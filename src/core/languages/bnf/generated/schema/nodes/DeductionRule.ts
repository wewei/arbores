/**
 * DeductionRule node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { ElementListNode } from './ElementList.js';

/**
 * Deduction rule with sequence of elements
 *
 */
export interface DeductionRuleNode {
  readonly type: 'DeductionRule';
  readonly sequence: ElementListNode;
}