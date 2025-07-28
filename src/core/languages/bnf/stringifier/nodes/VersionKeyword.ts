/**
 * Stringifier for VersionKeyword node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:54:52.611Z
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