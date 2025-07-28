/**
 * OptionalComment node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
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