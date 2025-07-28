/**
 * Stringifier for Whitespace node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { WhitespaceToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier Whitespace token
 * Whitespace characters
 */
export function stringifyWhitespace(node: WhitespaceToken, options: StringifierOptions): string {
  return node.value;
}