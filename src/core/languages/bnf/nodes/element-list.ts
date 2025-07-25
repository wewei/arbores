/**
 * ElementList node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-25T09:51:40.600Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { ElementNode } from './element.js';

export interface ElementListNode {
  readonly type: 'ElementList';
  readonly elements: ElementNode;
}