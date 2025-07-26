/**
 * Stringifier for NameKeyword node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { NameKeywordToken } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';

/**
 * stringifier NameKeyword token
 * The "name:" keyword
 */
export function stringifyNameKeyword(node: NameKeywordToken, options: StringifierOptions): string {
  return node.value;
}