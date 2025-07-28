/**
 * NameDeclaration node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:54:52.587Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { IdentifierToken, NewlineToken } from '../token-types.js';

/**
 * Grammar name declaration
 *
 */
export interface NameDeclarationNode {
  readonly type: 'NameDeclaration';
  readonly value: IdentifierToken;
  readonly newline: NewlineToken;
}