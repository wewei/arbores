/**
 * Stringifier for TokenRule node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { TokenPattern, TokenRuleNode } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier TokenRule deduction node
 * Token rule with string or regex pattern
 */
export function stringifyTokenRule(node: TokenRuleNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: pattern (TokenPattern)
  if (node.pattern) {
    parts.push(stringifyNode(node.pattern, options));
  }

  return parts.join('');
}