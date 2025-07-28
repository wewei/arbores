/**
 * Stringifier for Regex node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.933Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { RegexToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier Regex token
 * A regular expression pattern
 */
export function stringifyRegex(node: RegexToken, options: StringifierOptions): string {
  return node.value;
}