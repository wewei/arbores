/**
 * Stringifier for Comment node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.933Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { CommentToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier Comment token
 * A comment line starting with
 */
export function stringifyComment(node: CommentToken, options: StringifierOptions): string {
  return node.value;
}