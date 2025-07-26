/**
 * VersionDeclaration node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T03:15:19.145Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { IdentifierToken, NewlineToken } from '../token-types.js';

/**
 * Grammar version declaration
 *
 */
export interface VersionDeclarationNode {
  readonly type: 'VersionDeclaration';
  readonly value: IdentifierToken;
  readonly newline: NewlineToken;
}