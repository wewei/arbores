/**
 * Stringifier for UnionMemberList node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { AdditionalMembersNode, IdentifierToken, UnionMemberListNode } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier UnionMemberList deduction node
 * List of union members separated by |
 */
export function stringifyUnionMemberList(node: UnionMemberListNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: first (Identifier)
  if (node.first) {
    parts.push(stringifyNode(node.first, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: rest (AdditionalMembers)
  if (node.rest) {
    parts.push(stringifyNode(node.rest, options));
  }

  return parts.join('');
}