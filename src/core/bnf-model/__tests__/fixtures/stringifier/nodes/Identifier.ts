/**
 * Stringifier for Identifier node
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-27T07:30:05.482Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { IdentifierToken } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';

/**
 * stringifier Identifier token
 * A variable identifier
 */
export function stringifyIdentifier(node: IdentifierToken, options: StringifierOptions): string {
  return node.value;
}