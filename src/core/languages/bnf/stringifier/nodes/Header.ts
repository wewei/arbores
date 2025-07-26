/**
 * Stringifier for Header node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { HeaderNode, NameDeclarationNode, StartDeclarationNode, VersionDeclarationNode } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier Header deduction node
 * Grammar header with metadata
 */
export function stringifyHeader(node: HeaderNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: name (NameDeclaration)
  if (node.name) {
    parts.push(stringifyNode(node.name, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: version (VersionDeclaration)
  if (node.version) {
    parts.push(stringifyNode(node.version, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: start (StartDeclaration)
  if (node.start) {
    parts.push(stringifyNode(node.start, options));
  }

  return parts.join('');
}