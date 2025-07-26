/**
 * Element node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:02:29.782Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { IdentifierToken } from '../token-types.js';
import type { OptionalPropertyNode } from './optional-property.js';

/**
 * Single element in a sequence
 *
 */
export interface ElementNode {
  readonly type: 'Element';
  readonly node: IdentifierToken;
  readonly property: OptionalPropertyNode;
}