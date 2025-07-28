/**
 * Stringifier for Rule node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { NewlineToken, OptionalCommentNode, RuleDefinitionNode, RuleNode } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';
import { getIndentation, addWhitespace, formatToken } from '../utils';

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