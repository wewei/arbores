/**
 * RuleDefinition node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
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