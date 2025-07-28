/**
 * Stringifier for Newline node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { NewlineToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier Newline token
 * Line break character
 */
export function stringifyNewline(node: NewlineToken, options: StringifierOptions): string {
  return node.value;
}