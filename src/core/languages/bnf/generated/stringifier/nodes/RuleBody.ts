/**
 * Stringifier for RuleBody node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { RuleBody } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';

/**
 * stringifier RuleBody union node
 * Body of a rule - can be token, deduction, or union
 */
export function stringifyRuleBody(node: RuleBody, options: StringifierOptions): string {
  // Union nodes delegate to their actual type
  return stringifyNode(node, options);
}