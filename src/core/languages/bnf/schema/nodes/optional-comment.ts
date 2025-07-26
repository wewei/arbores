/**
 * OptionalComment node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:02:29.782Z
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