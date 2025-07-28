/**
 * RuleDefinition node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.902Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { IdentifierToken } from '../token-types.js';
import type { RuleBody } from '../union-types.js';

/**
 * Rule name and body definition
 *
 */
export interface RuleDefinitionNode {
  readonly type: 'RuleDefinition';
  readonly name: IdentifierToken;
  readonly body: RuleBody;
}