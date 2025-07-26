/**
 * Stringifier for RuleBody node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { RuleBody } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';

/**
 * stringifier RuleBody union node
 * Body of a rule - can be token, deduction, or union
 */
export function stringifyRuleBody(node: RuleBody, options: StringifierOptions): string {
  // Union nodes delegate to their actual type
  return stringifyNode(node, options);
}