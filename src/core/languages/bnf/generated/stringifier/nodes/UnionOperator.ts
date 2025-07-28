/**
 * Stringifier for UnionOperator node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
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