/**
 * AdditionalMembers node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:54:52.588Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { IdentifierToken } from '../token-types.js';

/**
 * Additional union members
 *
 */
export interface AdditionalMembersNode {
  readonly type: 'AdditionalMembers';
  readonly member: IdentifierToken;
}