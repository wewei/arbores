/**
 * BinaryExpression node definition
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-27T02:51:16.741Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { Expression, Operator } from '../union-types.js';

/**
 * Binary arithmetic expression
 *
 * @precedence 1
 * @associativity left
 */
export interface BinaryExpressionNode {
  readonly type: 'BinaryExpression';
  readonly left: Expression;
  readonly operator: Operator;
  readonly right: Expression;
}