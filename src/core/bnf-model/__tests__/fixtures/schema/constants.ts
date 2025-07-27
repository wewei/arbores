/**
 * Constants and registries
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-27T02:51:16.742Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
/**
 * Token pattern registry for the grammar
 */
export const TOKEN_PATTERNS = {
  Identifier: { regex: '[a-zA-Z_][a-zA-Z0-9_]*' },
  Number: { regex: '\\d+' },
  Plus: '+',
  Minus: '-',
  LeftParen: '(',
  RightParen: ')',
} as const;

/**
 * Precedence registry for deduction rules
 */
export const PRECEDENCE = {
  BinaryExpression: 1,
} as const;

/**
 * Associativity registry for deduction rules
 */
export const ASSOCIATIVITY = {
  BinaryExpression: 'left',
} as const;