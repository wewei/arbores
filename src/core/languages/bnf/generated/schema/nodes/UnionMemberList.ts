/**
 * UnionMemberList node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { IdentifierToken } from '../token-types.js';
import type { AdditionalMembersNode } from './AdditionalMembers.js';

/**
 * List of union members separated by |
 *
 */
export interface UnionMemberListNode {
  readonly type: 'UnionMemberList';
  readonly first: IdentifierToken;
  readonly rest: AdditionalMembersNode;
}