/**
 * Stringifier for Grammar node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.933Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { GrammarNode, HeaderNode, RuleListNode } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';
import { getIndentation, addWhitespace, formatToken } from '../utils';

/**
 * stringifier Grammar deduction node
 * Complete BNF grammar definition
 */
export function stringifyGrammar(node: GrammarNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: header (Header)
  if (node.header) {
    parts.push(stringifyNode(node.header, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: rules (RuleList)
  if (node.rules) {
    parts.push(stringifyNode(node.rules, options));
  }

  return parts.join('');
}