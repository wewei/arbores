/**
 * Union type definitions
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-25T02:28:11.364Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { SimpleMathToken } from './token-types.js';

export type Term = IdentifierToken | NumberToken | ParenExpressionNode;
export type Operator = PlusToken | MinusToken;
export type Expression = Term | BinaryExpressionNode;