/**
 * Stringifier for Regex node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
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