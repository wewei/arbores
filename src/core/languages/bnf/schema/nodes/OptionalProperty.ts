/**
 * OptionalProperty node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T09:37:45.220Z
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