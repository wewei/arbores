/**
 * Stringifier for StartKeyword node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { StartKeywordToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier StartKeyword token
 * The "start:" keyword
 */
export function stringifyStartKeyword(node: StartKeywordToken, options: StringifierOptions): string {
  return node.value;
}