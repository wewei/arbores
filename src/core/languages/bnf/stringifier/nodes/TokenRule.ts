/**
 * Stringifier for TokenRule node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.934Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { TokenPattern, TokenRuleNode } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';
import { getIndentation, addWhitespace, formatToken } from '../utils';

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