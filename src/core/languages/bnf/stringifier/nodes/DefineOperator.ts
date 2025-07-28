/**
 * Stringifier for DefineOperator node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.933Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { DefineOperatorToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier DefineOperator token
 * The "::" definition operator
 */
export function stringifyDefineOperator(node: DefineOperatorToken, options: StringifierOptions): string {
  return node.value;
}