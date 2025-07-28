/**
 * Stringifier for VersionKeyword node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { VersionKeywordToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier VersionKeyword token
 * The "version:" keyword
 */
export function stringifyVersionKeyword(node: VersionKeywordToken, options: StringifierOptions): string {
  return node.value;
}