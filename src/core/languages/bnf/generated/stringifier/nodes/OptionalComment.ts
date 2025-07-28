/**
 * Stringifier for OptionalComment node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { CommentToken, NewlineToken, OptionalCommentNode } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';
import { getIndentation, addWhitespace, formatToken } from '../utils';

/**
 * stringifier OptionalComment deduction node
 * Optional comment before rule
 */
export function stringifyOptionalComment(node: OptionalCommentNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: comment (Comment)
  if (node.comment) {
    parts.push(stringifyNode(node.comment, options));
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