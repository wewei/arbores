/**
 * Union type definitions
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:02:29.782Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { StringToken, RegexToken, IdentifierToken, NumberToken, CommentToken, NameKeywordToken, VersionKeywordToken, StartKeywordToken, DefineOperatorToken, UnionOperatorToken, PropertyOperatorToken, WhitespaceToken, NewlineToken } from './token-types.js';
import type { TokenRuleNode } from './nodes/token-rule.js';
import type { DeductionRuleNode } from './nodes/deduction-rule.js';
import type { UnionRuleNode } from './nodes/union-rule.js';
import type { GrammarNode } from './nodes/grammar.js';
import type { HeaderNode } from './nodes/header.js';
import type { NameDeclarationNode } from './nodes/name-declaration.js';
import type { VersionDeclarationNode } from './nodes/version-declaration.js';
import type { StartDeclarationNode } from './nodes/start-declaration.js';
import type { RuleListNode } from './nodes/rule-list.js';
import type { RuleNode } from './nodes/rule.js';
import type { OptionalCommentNode } from './nodes/optional-comment.js';
import type { RuleDefinitionNode } from './nodes/rule-definition.js';
import type { ElementListNode } from './nodes/element-list.js';
import type { ElementNode } from './nodes/element.js';
import type { OptionalPropertyNode } from './nodes/optional-property.js';
import type { UnionMemberListNode } from './nodes/union-member-list.js';
import type { AdditionalMembersNode } from './nodes/additional-members.js';

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