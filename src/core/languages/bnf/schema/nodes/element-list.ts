/**
 * ElementList node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:02:29.782Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { ElementNode } from './element.js';

/**
 * Sequence of elements in a deduction rule
 *
 */
export interface ElementListNode {
  readonly type: 'ElementList';
  readonly elements: ElementNode;
}