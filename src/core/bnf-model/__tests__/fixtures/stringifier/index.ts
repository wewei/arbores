/**
 * Stringifier functions for SimpleMath grammar
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-27T07:30:05.482Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { BinaryExpressionNode, Expression, IdentifierToken, LeftParenToken, MinusToken, NumberToken, Operator, ParenExpressionNode, PlusToken, RightParenToken, Term } from '../schema/index.js';

import type { StringifierOptions } from './types.js';

import { stringifyIdentifier } from './nodes/Identifier.js';
import { stringifyNumber } from './nodes/Number.js';
import { stringifyPlus } from './nodes/Plus.js';
import { stringifyMinus } from './nodes/Minus.js';
import { stringifyLeftParen } from './nodes/LeftParen.js';
import { stringifyRightParen } from './nodes/RightParen.js';
import { stringifyTerm } from './nodes/Term.js';
import { stringifyOperator } from './nodes/Operator.js';
import { stringifyExpression } from './nodes/Expression.js';
import { stringifyBinaryExpression } from './nodes/BinaryExpression.js';
import { stringifyParenExpression } from './nodes/ParenExpression.js';

export { stringifyIdentifier };
export { stringifyNumber };
export { stringifyPlus };
export { stringifyMinus };
export { stringifyLeftParen };
export { stringifyRightParen };
export { stringifyTerm };
export { stringifyOperator };
export { stringifyExpression };
export { stringifyBinaryExpression };
export { stringifyParenExpression };

export type { StringifierOptions } from './types.js';
export { getIndentation, addWhitespace, formatToken } from './utils.js';

/**
 * Main stringifier function type
 */
export type StringifySimpleMathFunction = (
  node: Expression, 
  options?: StringifierOptions
) => string;

/**
 * Main stringifier function for SimpleMath nodes
 */
export function stringifySimpleMath(node: Expression, options: StringifierOptions = {}): string {
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
 * Generic node stringifier function that dispatches to specific node types
 */
export function stringifyNode(node: any, options: StringifierOptions): string {
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