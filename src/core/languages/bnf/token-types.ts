/**
 * Token type definitions
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-25T09:51:40.599Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

export interface IdentifierToken {
  readonly type: 'Identifier';
  readonly value: string;

}
export interface StringToken {
  readonly type: 'String';
  readonly value: string;

}
export interface RegexToken {
  readonly type: 'Regex';
  readonly value: string;

}
export interface NumberToken {
  readonly type: 'Number';
  readonly value: string;

}
export interface CommentToken {
  readonly type: 'Comment';
  readonly value: string;

}
export interface NameKeywordToken {
  readonly type: 'NameKeyword';
  readonly value: string;

}
export interface VersionKeywordToken {
  readonly type: 'VersionKeyword';
  readonly value: string;

}
export interface StartKeywordToken {
  readonly type: 'StartKeyword';
  readonly value: string;

}
export interface DefineOperatorToken {
  readonly type: 'DefineOperator';
  readonly value: string;

}
export interface UnionOperatorToken {
  readonly type: 'UnionOperator';
  readonly value: string;

}
export interface PropertyOperatorToken {
  readonly type: 'PropertyOperator';
  readonly value: string;

}
export interface WhitespaceToken {
  readonly type: 'Whitespace';
  readonly value: string;

}
export interface NewlineToken {
  readonly type: 'Newline';
  readonly value: string;

}

/**
 * Union of all token types in the BNFGrammar grammar
 */
export type BNFGrammarToken = IdentifierToken | StringToken | RegexToken | NumberToken | CommentToken | NameKeywordToken | VersionKeywordToken | StartKeywordToken | DefineOperatorToken | UnionOperatorToken | PropertyOperatorToken | WhitespaceToken | NewlineToken;

// Token constants
export const IDENTIFIER_TOKEN = 'Identifier' as const;
export const STRING_TOKEN = 'String' as const;
export const REGEX_TOKEN = 'Regex' as const;
export const NUMBER_TOKEN = 'Number' as const;
export const COMMENT_TOKEN = 'Comment' as const;
export const NAMEKEYWORD_TOKEN = 'NameKeyword' as const;
export const VERSIONKEYWORD_TOKEN = 'VersionKeyword' as const;
export const STARTKEYWORD_TOKEN = 'StartKeyword' as const;
export const DEFINEOPERATOR_TOKEN = 'DefineOperator' as const;
export const UNIONOPERATOR_TOKEN = 'UnionOperator' as const;
export const PROPERTYOPERATOR_TOKEN = 'PropertyOperator' as const;
export const WHITESPACE_TOKEN = 'Whitespace' as const;
export const NEWLINE_TOKEN = 'Newline' as const;