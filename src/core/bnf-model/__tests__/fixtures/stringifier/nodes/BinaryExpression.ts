/**
 * Stringifier for BinaryExpression node
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-27T07:30:05.482Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { BinaryExpressionNode, Expression, Operator } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier BinaryExpression deduction node
 * Binary arithmetic expression
 */
export function stringifyBinaryExpression(node: BinaryExpressionNode, options: StringifierOptions): string {
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