/**
 * NameDeclaration node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T09:37:45.220Z
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