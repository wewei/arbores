/**
 * BinaryExpression node definition
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-25T02:28:11.364Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { Expression, Operator } from './index.js';

export interface BinaryExpressionNode {
  readonly type: 'BinaryExpression';
    readonly left: Expression;
    readonly operator: Operator;
    readonly right: Expression;
}