/**
 * Stringifier for String node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { StringToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier String token
 * A quoted string literal
 */
export function stringifyString(node: StringToken, options: StringifierOptions): string {
  return node.value;
}