/**
 * Stringifier for ParenExpression node
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-27T07:30:05.482Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { Expression, ParenExpressionNode } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier ParenExpression deduction node
 * Parenthesized expression
 */
export function stringifyParenExpression(node: ParenExpressionNode, options: StringifierOptions): string {
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