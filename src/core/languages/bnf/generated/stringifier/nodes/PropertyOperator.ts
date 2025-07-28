/**
 * Stringifier for PropertyOperator node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
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