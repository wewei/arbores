/**
 * Token type definitions
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-25T02:28:11.363Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

export interface IdentifierToken {
  readonly type: 'Identifier';
  readonly value: string;

}
export interface NumberToken {
  readonly type: 'Number';
  readonly value: string;

}
export interface PlusToken {
  readonly type: 'Plus';
  readonly value: string;

}
export interface MinusToken {
  readonly type: 'Minus';
  readonly value: string;

}
export interface LeftParenToken {
  readonly type: 'LeftParen';
  readonly value: string;

}
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