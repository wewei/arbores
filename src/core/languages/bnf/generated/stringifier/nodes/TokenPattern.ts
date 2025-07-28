/**
 * Stringifier for TokenPattern node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { TokenPattern } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';

/**
 * stringifier TokenPattern union node
 * Either a string literal or regex pattern
 */
export function stringifyTokenPattern(node: TokenPattern, options: StringifierOptions): string {
  // Union nodes delegate to their actual type
  return stringifyNode(node, options);
}