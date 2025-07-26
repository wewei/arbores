/**
 * Stringifier for Whitespace node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { WhitespaceToken } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';

/**
 * stringifier Whitespace token
 * Whitespace characters
 */
export function stringifyWhitespace(node: WhitespaceToken, options: StringifierOptions): string {
  return node.value;
}