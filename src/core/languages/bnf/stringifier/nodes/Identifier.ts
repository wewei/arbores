/**
 * Stringifier for Identifier node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { IdentifierToken } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';

/**
 * stringifier Identifier token
 * An identifier (node name, property name, etc.)
 */
export function stringifyIdentifier(node: IdentifierToken, options: StringifierOptions): string {
  return node.value;
}