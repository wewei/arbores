/**
 * ParenExpression node definition
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-27T07:30:05.480Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { Expression } from '../union-types.js';

/**
 * Parenthesized expression
 *
 */
export interface ParenExpressionNode {
  readonly type: 'ParenExpression';
  readonly expression: Expression;
}