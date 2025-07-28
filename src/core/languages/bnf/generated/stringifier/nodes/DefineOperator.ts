/**
 * Stringifier for DefineOperator node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
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