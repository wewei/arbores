/**
 * Union type definitions
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.903Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { StringToken, RegexToken, IdentifierToken, NumberToken, CommentToken, NameKeywordToken, VersionKeywordToken, StartKeywordToken, DefineOperatorToken, UnionOperatorToken, PropertyOperatorToken, WhitespaceToken, NewlineToken } from './token-types.js';
import type { TokenRuleNode } from './nodes/TokenRule.js';
import type { DeductionRuleNode } from './nodes/DeductionRule.js';
import type { UnionRuleNode } from './nodes/UnionRule.js';
import type { GrammarNode } from './nodes/Grammar.js';
import type { HeaderNode } from './nodes/Header.js';
import type { NameDeclarationNode } from './nodes/NameDeclaration.js';
import type { VersionDeclarationNode } from './nodes/VersionDeclaration.js';
import type { StartDeclarationNode } from './nodes/StartDeclaration.js';
import type { RuleListNode } from './nodes/RuleList.js';
import type { RuleNode } from './nodes/Rule.js';
import type { OptionalCommentNode } from './nodes/OptionalComment.js';
import type { RuleDefinitionNode } from './nodes/RuleDefinition.js';
import type { ElementListNode } from './nodes/ElementList.js';
import type { ElementNode } from './nodes/Element.js';
import type { OptionalPropertyNode } from './nodes/OptionalProperty.js';
import type { UnionMemberListNode } from './nodes/UnionMemberList.js';
import type { AdditionalMembersNode } from './nodes/AdditionalMembers.js';

/**
 * Either a string literal or regex pattern
 *
 * @members String,Regex
 */
export type TokenPattern = StringToken | RegexToken;
/**
 * Body of a rule - can be token, deduction, or union
 *
 * @members TokenRule,DeductionRule,UnionRule
 */
export type RuleBody = TokenRuleNode | DeductionRuleNode | UnionRuleNode;

/**
 * Union of all node types in the BNFGrammar grammar
 */
export type BNFGrammarNode = IdentifierToken | StringToken | RegexToken | NumberToken | CommentToken | NameKeywordToken | VersionKeywordToken | StartKeywordToken | DefineOperatorToken | UnionOperatorToken | PropertyOperatorToken | WhitespaceToken | NewlineToken | GrammarNode | HeaderNode | NameDeclarationNode | VersionDeclarationNode | StartDeclarationNode | RuleListNode | RuleNode | OptionalCommentNode | RuleDefinitionNode | TokenRuleNode | DeductionRuleNode | UnionRuleNode | ElementListNode | ElementNode | OptionalPropertyNode | UnionMemberListNode | AdditionalMembersNode | TokenPattern | RuleBody;

/**
 * The root node type for the grammar
 */
export type BNFGrammarRoot = GrammarNode;