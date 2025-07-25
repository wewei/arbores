/**
 * ParenExpression node definition
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-25T02:28:11.364Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { LeftParenToken, RightParenToken } from '../token-types.js';
import type { Expression } from './index.js';

export interface ParenExpressionNode {
  readonly type: 'ParenExpression';
    readonly expression: Expression;
}