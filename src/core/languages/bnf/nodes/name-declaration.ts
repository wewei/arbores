/**
 * NameDeclaration node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-25T09:51:40.599Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { IdentifierToken, NewlineToken } from '../token-types.js';

export interface NameDeclarationNode {
  readonly type: 'NameDeclaration';
  readonly value: IdentifierToken;
  readonly newline: NewlineToken;
}