/**
 * Stringifier for StartDeclaration node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:54:52.611Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { IdentifierToken, NewlineToken, StartDeclarationNode } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';
import { getIndentation, addWhitespace, formatToken } from '../utils';

/**
 * stringifier StartDeclaration deduction node
 * Grammar start rule declaration
 */
export function stringifyStartDeclaration(node: StartDeclarationNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: StartKeyword
  parts.push(stringifyNode(node, options));
  // Property: value (Identifier)
  if (node.value) {
    parts.push(stringifyNode(node.value, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: newline (Newline)
  if (node.newline) {
    parts.push(stringifyNode(node.newline, options));
  }

  return parts.join('');
}