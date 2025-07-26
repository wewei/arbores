/**
 * Stringifier for Newline node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { NewlineToken } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';

/**
 * stringifier Newline token
 * Line break character
 */
export function stringifyNewline(node: NewlineToken, options: StringifierOptions): string {
  return node.value;
}