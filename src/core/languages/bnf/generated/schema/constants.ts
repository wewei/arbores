/**
 * Constants and registries
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Model hash: 56d3cad3c691
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
/**
 * Token pattern registry for the grammar
 */
export const TOKEN_PATTERNS = {
  Identifier: { regex: '[a-zA-Z_][a-zA-Z0-9_]*' },
  String: { regex: '\'([^\'\\\\]|\\\\.)*\'' },
  Regex: { regex: '/([^/\\\\\\\\]|\\\\\\\\.)+/' },
  Number: { regex: '\\\\d+(\\\\.\\\\d+)?' },
  Comment: { regex: '#[^\\\\n]*' },
  NameKeyword: 'name:',
  VersionKeyword: 'version:',
  StartKeyword: 'start:',
  DefineOperator: '::',
  UnionOperator: '|',
  PropertyOperator: ':',
  Whitespace: { regex: '[ \\\\t]+' },
  Newline: { regex: '\\\\r?\\\\n' },
} as const;
