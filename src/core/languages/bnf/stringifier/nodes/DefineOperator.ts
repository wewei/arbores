/**
 * Stringifier for DefineOperator node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { DefineOperatorToken } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';

/**
 * stringifier DefineOperator token
 * The "::" definition operator
 */
export function stringifyDefineOperator(node: DefineOperatorToken, options: StringifierOptions): string {
  return node.value;
}