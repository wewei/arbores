/**
 * OptionalComment node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.643Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { CommentToken, NewlineToken } from '../token-types.js';

/**
 * Optional comment before rule
 *
 */
export interface OptionalCommentNode {
  readonly type: 'OptionalComment';
  readonly comment: CommentToken;
  readonly newline: NewlineToken;
}