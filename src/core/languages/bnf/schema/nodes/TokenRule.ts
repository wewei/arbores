/**
 * TokenRule node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.902Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { TokenPattern } from '../union-types.js';

/**
 * Token rule with string or regex pattern
 *
 */
export interface TokenRuleNode {
  readonly type: 'TokenRule';
  readonly pattern: TokenPattern;
}