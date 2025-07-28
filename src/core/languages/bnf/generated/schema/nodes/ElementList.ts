/**
 * ElementList node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { ElementNode } from './Element.js';

/**
 * Sequence of elements in a deduction rule
 *
 */
export interface ElementListNode {
  readonly type: 'ElementList';
  readonly elements: ElementNode;
}