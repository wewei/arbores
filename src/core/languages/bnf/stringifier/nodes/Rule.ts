/**
 * Stringifier for Rule node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { NewlineToken, OptionalCommentNode, RuleDefinitionNode, RuleNode } from '../../schema/index.js';
import type { StringifierOptions } from '../types.js';
import { stringifyNode } from '../index.js';
import { getIndentation, addWhitespace, formatToken } from '../utils.js';

/**
 * stringifier Rule deduction node
 * A single grammar rule definition
 */
export function stringifyRule(node: RuleNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: comment (OptionalComment)
  if (node.comment) {
    parts.push(stringifyNode(node.comment, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: definition (RuleDefinition)
  if (node.definition) {
    parts.push(stringifyNode(node.definition, options));
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