/**
 * Stringifier for Minus node
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-27T07:30:05.482Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { MinusToken } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';

/**
 * stringifier Minus token
 * Subtraction operator
 */
export function stringifyMinus(node: MinusToken, options: StringifierOptions): string {
  return node.value;
}