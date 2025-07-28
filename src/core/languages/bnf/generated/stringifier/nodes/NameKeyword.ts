/**
 * Stringifier for NameKeyword node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { NameKeywordToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier NameKeyword token
 * The "name:" keyword
 */
export function stringifyNameKeyword(node: NameKeywordToken, options: StringifierOptions): string {
  return node.value;
}