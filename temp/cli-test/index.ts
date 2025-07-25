/**
 * SimpleMath grammar type definitions
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-25T02:28:11.364Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
export * from './token-types.js';
export * from './union-types.js';
export * from './nodes/binary-expression.js';
export * from './nodes/paren-expression.js';
export * from './constants.js';

/**
 * Union of all node types in the SimpleMath grammar
 */
export type SimpleMathNode = IdentifierToken | NumberToken | PlusToken | MinusToken | LeftParenToken | RightParenToken | Term | Operator | Expression | BinaryExpressionNode | ParenExpressionNode;

/**
 * The root node type for the grammar
 */
export type SimpleMathRoot = Expression;
