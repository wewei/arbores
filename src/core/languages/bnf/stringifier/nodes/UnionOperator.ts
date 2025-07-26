/**
 * Stringifier for UnionOperator node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { UnionOperatorToken } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';

/**
 * stringifier UnionOperator token
 * The "|" union operator
 */
export function stringifyUnionOperator(node: UnionOperatorToken, options: StringifierOptions): string {
  return node.value;
}