/**
 * Type definitions for stringify functions
 */

export interface StringifyOptions {
  /** Current indentation level */
  indent?: number;
  /** Indentation string (spaces or tabs) */
  indentString?: string;
  /** Whether to include whitespace */
  includeWhitespace?: boolean;
  /** Whether to format output */
  format?: boolean;
  /** Custom formatting rules */
  formatting?: {
    /** Insert newlines after certain tokens */
    newlineAfter?: string[];
    /** Insert spaces around certain tokens */
    spaceAround?: string[];
    /** Compact mode (minimal whitespace) */
    compact?: boolean;
  };
}

/**
 * Main stringify function type
 */
export type StringifySimpleMathFunction = (
  node: Expression, 
  options?: StringifyOptions
) => string;

/**
 * Export the main stringify function
 */
export declare const stringifySimpleMath: StringifySimpleMathFunction;

/**
 * Stringify functions for SimpleMath grammar
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-25T02:28:17.042Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { BinaryExpressionNode, Expression, IdentifierToken, LeftParenToken, MinusToken, NumberToken, Operator, ParenExpressionNode, PlusToken, RightParenToken, Term } from './index.js';

/**
 * Main stringify function for SimpleMath nodes
 */
export function stringifySimpleMath(node: Expression, options: StringifyOptions = {}): string {
  const opts = {
    indent: 0,
    indentString: '  ',
    includeWhitespace: true,
    format: true,
    ...options,
  };

  return stringifyNode(node, opts);
}

/**
 * Generic node stringify function that dispatches to specific node types
 */
function stringifyNode(node: any, options: StringifyOptions): string {
  if (!node || typeof node !== 'object' || !node.type) {
    throw new Error('Invalid node: must have a type property');
  }

  switch (node.type) {
    case 'Identifier':
      return stringifyIdentifier(node, options);
    case 'Number':
      return stringifyNumber(node, options);
    case 'Plus':
      return stringifyPlus(node, options);
    case 'Minus':
      return stringifyMinus(node, options);
    case 'LeftParen':
      return stringifyLeftParen(node, options);
    case 'RightParen':
      return stringifyRightParen(node, options);
    case 'Term':
      return stringifyTerm(node, options);
    case 'Operator':
      return stringifyOperator(node, options);
    case 'Expression':
      return stringifyExpression(node, options);
    case 'BinaryExpression':
      return stringifyBinaryExpression(node, options);
    case 'ParenExpression':
      return stringifyParenExpression(node, options);
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

/**
 * Stringify Identifier token
 * A variable identifier
 */
function stringifyIdentifier(node: IdentifierToken, options: StringifyOptions): string {
  return node.value;
}

/**
 * Stringify Number token
 * A numeric literal
 */
function stringifyNumber(node: NumberToken, options: StringifyOptions): string {
  return node.value;
}

/**
 * Stringify Plus token
 * Addition operator
 */
function stringifyPlus(node: PlusToken, options: StringifyOptions): string {
  return node.value;
}

/**
 * Stringify Minus token
 * Subtraction operator
 */
function stringifyMinus(node: MinusToken, options: StringifyOptions): string {
  return node.value;
}

/**
 * Stringify LeftParen token
 * Left parenthesis
 */
function stringifyLeftParen(node: LeftParenToken, options: StringifyOptions): string {
  return node.value;
}

/**
 * Stringify RightParen token
 * Right parenthesis
 */
function stringifyRightParen(node: RightParenToken, options: StringifyOptions): string {
  return node.value;
}

/**
 * Stringify Term union node
 * A basic term in an expression
 */
function stringifyTerm(node: Term, options: StringifyOptions): string {
  // Union nodes delegate to their actual type
  return stringifyNode(node, options);
}

/**
 * Stringify Operator union node
 * Arithmetic operators
 */
function stringifyOperator(node: Operator, options: StringifyOptions): string {
  // Union nodes delegate to their actual type
  return stringifyNode(node, options);
}

/**
 * Stringify Expression union node
 * Any valid expression
 */
function stringifyExpression(node: Expression, options: StringifyOptions): string {
  // Union nodes delegate to their actual type
  return stringifyNode(node, options);
}

/**
 * Stringify BinaryExpression deduction node
 * Binary arithmetic expression
 */
function stringifyBinaryExpression(node: BinaryExpressionNode, options: StringifyOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: left (Expression)
  if (node.left) {
    parts.push(stringifyNode(node.left, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: operator (Operator)
  if (node.operator) {
    parts.push(stringifyNode(node.operator, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: right (Expression)
  if (node.right) {
    parts.push(stringifyNode(node.right, options));
  }

  return parts.join('');
}

/**
 * Stringify ParenExpression deduction node
 * Parenthesized expression
 */
function stringifyParenExpression(node: ParenExpressionNode, options: StringifyOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: LeftParen
  parts.push(stringifyNode(node, options));
  // Property: expression (Expression)
  if (node.expression) {
    parts.push(stringifyNode(node.expression, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Token reference: RightParen
  parts.push(stringifyNode(node, options));

  return parts.join('');
}

/**
 * Get indentation string based on options
 */
function getIndentation(options: StringifyOptions): string {
  const level = options.indent || 0;
  const indentStr = options.indentString || '  ';
  return indentStr.repeat(level);
}

/**
 * Add formatting whitespace if enabled
 */
function addWhitespace(parts: string[], options: StringifyOptions, type: 'space' | 'newline' = 'space'): void {
  if (options.format && options.includeWhitespace) {
    if (type === 'newline') {
      parts.push('\n');
    } else {
      parts.push(' ');
    }
  }
}

/**
 * Format token output with optional spacing
 */
function formatToken(value: string, options: StringifyOptions, context?: string): string {
  if (!options.format || !options.includeWhitespace) {
    return value;
  }

  // Add context-specific formatting rules here
  if (options.formatting?.spaceAround?.includes(value)) {
    return ` ${value} `;
  }

  return value;
}