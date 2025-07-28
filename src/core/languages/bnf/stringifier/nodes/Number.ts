/**
 * Stringifier for Number node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:54:52.611Z
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