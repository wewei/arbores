/**
 * Stringifier for Identifier node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { IdentifierToken } from '../../schema/index';
import type { StringifierOptions } from '../types';

/**
 * stringifier Identifier token
 * An identifier (node name, property name, etc.)
 */
export function stringifyIdentifier(node: IdentifierToken, options: StringifierOptions): string {
  return node.value;
}