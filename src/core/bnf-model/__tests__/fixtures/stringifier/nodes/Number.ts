/**
 * Stringifier for Number node
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-27T07:30:05.482Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { NumberToken } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';

/**
 * stringifier Number token
 * A numeric literal
 */
export function stringifyNumber(node: NumberToken, options: StringifierOptions): string {
  return node.value;
}