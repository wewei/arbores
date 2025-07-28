/**
 * Stringifier for UnionOperator node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:54:52.611Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { UnionOperatorToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier UnionOperator token
 * The "|" union operator
 */
export function stringifyUnionOperator(node: UnionOperatorToken, options: StringifierOptions): string {
  return node.value;
}