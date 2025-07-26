/**
 * Stringifier for VersionDeclaration node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { IdentifierToken, NewlineToken, VersionDeclarationNode } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier VersionDeclaration deduction node
 * Grammar version declaration
 */
export function stringifyVersionDeclaration(node: VersionDeclarationNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: VersionKeyword
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