/**
 * Stringifier for Operator node
 * 
 * Generated from BNF model: SimpleMath v1.0.0
 * Generation time: 2025-07-27T07:30:05.482Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { Operator } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';

/**
 * stringifier Operator union node
 * Arithmetic operators
 */
export function stringifyOperator(node: Operator, options: StringifierOptions): string {
  // Union nodes delegate to their actual type
  return stringifyNode(node, options);
}