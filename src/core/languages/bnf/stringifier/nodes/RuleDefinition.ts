/**
 * Stringifier for RuleDefinition node
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.934Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { IdentifierToken, RuleBody, RuleDefinitionNode } from '../../schema/index';
import type { StringifierOptions } from '../types';
import { stringifyNode } from '../index';
import { getIndentation, addWhitespace, formatToken } from '../utils';

/**
 * stringifier RuleDefinition deduction node
 * Rule name and body definition
 */
export function stringifyRuleDefinition(node: RuleDefinitionNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: name (Identifier)
  if (node.name) {
    parts.push(stringifyNode(node.name, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Token reference: DefineOperator
  parts.push(stringifyNode(node, options));
  // Property: body (RuleBody)
  if (node.body) {
    parts.push(stringifyNode(node.body, options));
  }

  return parts.join('');
}