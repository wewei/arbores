/**
 * Stringifier for AdditionalMembers node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { AdditionalMembersNode, IdentifierToken } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier AdditionalMembers deduction node
 * Additional union members
 */
export function stringifyAdditionalMembers(node: AdditionalMembersNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: UnionOperator
  parts.push(stringifyNode(node, options));
  // Property: member (Identifier)
  if (node.member) {
    parts.push(stringifyNode(node.member, options));
  }

  return parts.join('');
}