/**
 * Stringifier functions for BNFGrammar grammar
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:31:39.646Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { AdditionalMembersNode, CommentToken, DeductionRuleNode, DefineOperatorToken, ElementListNode, ElementNode, GrammarNode, HeaderNode, IdentifierToken, NameDeclarationNode, NameKeywordToken, NewlineToken, NumberToken, OptionalCommentNode, OptionalPropertyNode, PropertyOperatorToken, RegexToken, RuleBody, RuleDefinitionNode, RuleListNode, RuleNode, StartDeclarationNode, StartKeywordToken, StringToken, TokenPattern, TokenRuleNode, UnionMemberListNode, UnionOperatorToken, UnionRuleNode, VersionDeclarationNode, VersionKeywordToken, WhitespaceToken } from '../schema/index.js';

import type { StringifierOptions } from './types.js';

import { stringifyIdentifier } from './nodes/Identifier.js';
import { stringifyString } from './nodes/String.js';
import { stringifyRegex } from './nodes/Regex.js';
import { stringifyNumber } from './nodes/Number.js';
import { stringifyComment } from './nodes/Comment.js';
import { stringifyNameKeyword } from './nodes/NameKeyword.js';
import { stringifyVersionKeyword } from './nodes/VersionKeyword.js';
import { stringifyStartKeyword } from './nodes/StartKeyword.js';
import { stringifyDefineOperator } from './nodes/DefineOperator.js';
import { stringifyUnionOperator } from './nodes/UnionOperator.js';
import { stringifyPropertyOperator } from './nodes/PropertyOperator.js';
import { stringifyWhitespace } from './nodes/Whitespace.js';
import { stringifyNewline } from './nodes/Newline.js';
import { stringifyGrammar } from './nodes/Grammar.js';
import { stringifyHeader } from './nodes/Header.js';
import { stringifyNameDeclaration } from './nodes/NameDeclaration.js';
import { stringifyVersionDeclaration } from './nodes/VersionDeclaration.js';
import { stringifyStartDeclaration } from './nodes/StartDeclaration.js';
import { stringifyRuleList } from './nodes/RuleList.js';
import { stringifyRule } from './nodes/Rule.js';
import { stringifyOptionalComment } from './nodes/OptionalComment.js';
import { stringifyRuleDefinition } from './nodes/RuleDefinition.js';
import { stringifyTokenRule } from './nodes/TokenRule.js';
import { stringifyDeductionRule } from './nodes/DeductionRule.js';
import { stringifyUnionRule } from './nodes/UnionRule.js';
import { stringifyElementList } from './nodes/ElementList.js';
import { stringifyElement } from './nodes/Element.js';
import { stringifyOptionalProperty } from './nodes/OptionalProperty.js';
import { stringifyUnionMemberList } from './nodes/UnionMemberList.js';
import { stringifyAdditionalMembers } from './nodes/AdditionalMembers.js';
import { stringifyTokenPattern } from './nodes/TokenPattern.js';
import { stringifyRuleBody } from './nodes/RuleBody.js';

export { stringifyIdentifier };
export { stringifyString };
export { stringifyRegex };
export { stringifyNumber };
export { stringifyComment };
export { stringifyNameKeyword };
export { stringifyVersionKeyword };
export { stringifyStartKeyword };
export { stringifyDefineOperator };
export { stringifyUnionOperator };
export { stringifyPropertyOperator };
export { stringifyWhitespace };
export { stringifyNewline };
export { stringifyGrammar };
export { stringifyHeader };
export { stringifyNameDeclaration };
export { stringifyVersionDeclaration };
export { stringifyStartDeclaration };
export { stringifyRuleList };
export { stringifyRule };
export { stringifyOptionalComment };
export { stringifyRuleDefinition };
export { stringifyTokenRule };
export { stringifyDeductionRule };
export { stringifyUnionRule };
export { stringifyElementList };
export { stringifyElement };
export { stringifyOptionalProperty };
export { stringifyUnionMemberList };
export { stringifyAdditionalMembers };
export { stringifyTokenPattern };
export { stringifyRuleBody };

export type { StringifierOptions } from './types.js';
export { getIndentation, addWhitespace, formatToken } from './utils.js';

/**
 * Main stringifier function type
 */
export type StringifyBNFGrammarFunction = (
  node: GrammarNode, 
  options?: StringifierOptions
) => string;

/**
 * Main stringifier function for BNFGrammar nodes
 */
export function stringifyBNFGrammar(node: GrammarNode, options: StringifierOptions = {}): string {
  const opts = {
    indent: 0,
    indentString: '  ',
    includeWhitespace: true,
    format: true,
    ...options,
  };

  return stringifyNode(node, opts);
}

/**
 * Generic node stringifier function that dispatches to specific node types
 */
export function stringifyNode(node: any, options: StringifierOptions): string {
  if (!node || typeof node !== 'object' || !node.type) {
    throw new Error('Invalid node: must have a type property');
  }

  switch (node.type) {
    case 'Identifier':
      return stringifyIdentifier(node, options);
    case 'String':
      return stringifyString(node, options);
    case 'Regex':
      return stringifyRegex(node, options);
    case 'Number':
      return stringifyNumber(node, options);
    case 'Comment':
      return stringifyComment(node, options);
    case 'NameKeyword':
      return stringifyNameKeyword(node, options);
    case 'VersionKeyword':
      return stringifyVersionKeyword(node, options);
    case 'StartKeyword':
      return stringifyStartKeyword(node, options);
    case 'DefineOperator':
      return stringifyDefineOperator(node, options);
    case 'UnionOperator':
      return stringifyUnionOperator(node, options);
    case 'PropertyOperator':
      return stringifyPropertyOperator(node, options);
    case 'Whitespace':
      return stringifyWhitespace(node, options);
    case 'Newline':
      return stringifyNewline(node, options);
    case 'Grammar':
      return stringifyGrammar(node, options);
    case 'Header':
      return stringifyHeader(node, options);
    case 'NameDeclaration':
      return stringifyNameDeclaration(node, options);
    case 'VersionDeclaration':
      return stringifyVersionDeclaration(node, options);
    case 'StartDeclaration':
      return stringifyStartDeclaration(node, options);
    case 'RuleList':
      return stringifyRuleList(node, options);
    case 'Rule':
      return stringifyRule(node, options);
    case 'OptionalComment':
      return stringifyOptionalComment(node, options);
    case 'RuleDefinition':
      return stringifyRuleDefinition(node, options);
    case 'TokenRule':
      return stringifyTokenRule(node, options);
    case 'DeductionRule':
      return stringifyDeductionRule(node, options);
    case 'UnionRule':
      return stringifyUnionRule(node, options);
    case 'ElementList':
      return stringifyElementList(node, options);
    case 'Element':
      return stringifyElement(node, options);
    case 'OptionalProperty':
      return stringifyOptionalProperty(node, options);
    case 'UnionMemberList':
      return stringifyUnionMemberList(node, options);
    case 'AdditionalMembers':
      return stringifyAdditionalMembers(node, options);
    case 'TokenPattern':
      return stringifyTokenPattern(node, options);
    case 'RuleBody':
      return stringifyRuleBody(node, options);
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}