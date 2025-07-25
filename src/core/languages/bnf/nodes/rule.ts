/**
 * Rule node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-25T09:51:40.599Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { NewlineToken } from '../token-types.js';
import type { OptionalCommentNode } from './optional-comment.js';
import type { RuleDefinitionNode } from './rule-definition.js';

export interface RuleNode {
  readonly type: 'Rule';
  readonly comment: OptionalCommentNode;
  readonly definition: RuleDefinitionNode;
  readonly newline: NewlineToken;
}