/**
 * OptionalProperty node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { IdentifierToken } from '../token-types.js';

/**
 * Optional property assignment
 *
 */
export interface OptionalPropertyNode {
  readonly type: 'OptionalProperty';
  readonly name: IdentifierToken;
}