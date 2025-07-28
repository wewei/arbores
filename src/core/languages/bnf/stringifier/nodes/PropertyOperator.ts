/**
 * Stringifier for PropertyOperator node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.933Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { PropertyOperatorToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier PropertyOperator token
 * The ":" property assignment operator
 */
export function stringifyPropertyOperator(node: PropertyOperatorToken, options: StringifierOptions): string {
  return node.value;
}