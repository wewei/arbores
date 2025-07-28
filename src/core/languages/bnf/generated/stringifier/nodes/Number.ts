/**
 * Stringifier for Number node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { NumberToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier Number token
 * A numeric value
 */
export function stringifyNumber(node: NumberToken, options: StringifierOptions): string {
  return node.value;
}