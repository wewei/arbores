/**
 * Union type definitions
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-27T02:51:16.742Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { IdentifierToken, NumberToken, PlusToken, MinusToken, LeftParenToken, RightParenToken } from './token-types.js';
import type { ParenExpressionNode } from './nodes/ParenExpression.js';
import type { BinaryExpressionNode } from './nodes/BinaryExpression.js';

/**
 * A basic term in an expression
 *
 * @members Identifier,Number,ParenExpression
 */
export type Term = IdentifierToken | NumberToken | ParenExpressionNode;
/**
 * Arithmetic operators
 *
 * @members Plus,Minus
 */
export type Operator = PlusToken | MinusToken;
/**
 * Any valid expression
 *
 * @members Term,BinaryExpression
 */
export type Expression = Term | BinaryExpressionNode;

/**
 * Union of all node types in the SimpleMath grammar
 */
export type SimpleMathNode = IdentifierToken | NumberToken | PlusToken | MinusToken | LeftParenToken | RightParenToken | Term | Operator | Expression | BinaryExpressionNode | ParenExpressionNode;

/**
 * The root node type for the grammar
 */
export type SimpleMathRoot = Expression;