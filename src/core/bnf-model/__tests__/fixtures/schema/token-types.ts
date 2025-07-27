/**
 * Token type definitions
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-27T02:51:16.741Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

/**
 * A variable identifier
 *
 * @pattern regex: [a-zA-Z_][a-zA-Z0-9_]*
 */
export interface IdentifierToken {
  readonly type: 'Identifier';
  readonly value: string;
}
/**
 * A numeric literal
 *
 * @pattern regex: \d+
 */
export interface NumberToken {
  readonly type: 'Number';
  readonly value: string;
}
/**
 * Addition operator
 *
 * @pattern +
 */
export interface PlusToken {
  readonly type: 'Plus';
  readonly value: string;
}
/**
 * Subtraction operator
 *
 * @pattern -
 */
export interface MinusToken {
  readonly type: 'Minus';
  readonly value: string;
}
/**
 * Left parenthesis
 *
 * @pattern (
 */
export interface LeftParenToken {
  readonly type: 'LeftParen';
  readonly value: string;
}
/**
 * Right parenthesis
 *
 * @pattern )
 */
export interface RightParenToken {
  readonly type: 'RightParen';
  readonly value: string;
}

/**
 * Union of all token types in the SimpleMath grammar
 */
export type SimpleMathToken = IdentifierToken | NumberToken | PlusToken | MinusToken | LeftParenToken | RightParenToken;

// Token constants
export const IDENTIFIER_TOKEN = 'Identifier' as const;
export const NUMBER_TOKEN = 'Number' as const;
export const PLUS_TOKEN = 'Plus' as const;
export const MINUS_TOKEN = 'Minus' as const;
export const LEFTPAREN_TOKEN = 'LeftParen' as const;
export const RIGHTPAREN_TOKEN = 'RightParen' as const;