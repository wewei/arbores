/**
 * Stringifier for UnionMemberList node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { AdditionalMembersNode, IdentifierToken, UnionMemberListNode } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';
import { getIndentation, addWhitespace, formatToken } from '../utils';

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