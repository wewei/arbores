/**
 * stringifier functions for BNFGrammar grammar
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:02:29.785Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

/**
 * Options for stringifier functions
 */
export interface StringifierOptions {
  /** Current indentation level */
  indent?: number;
  /** Indentation string (spaces or tabs) */
  indentString?: string;
  /** Whether to include whitespace */
  includeWhitespace?: boolean;
  /** Whether to format output */
  format?: boolean;
  /** Custom formatting rules */
  formatting?: {
    /** Insert newlines after certain tokens */
    newlineAfter?: string[];
    /** Insert spaces around certain tokens */
    spaceAround?: string[];
    /** Compact mode (minimal whitespace) */
    compact?: boolean;
  };
}

/**
 * Main stringifier function type
 */
export type StringifyBNFGrammarFunction = (
  node: GrammarNode, 
  options?: StringifierOptions
) => string;

import type { AdditionalMembersNode, CommentToken, DeductionRuleNode, DefineOperatorToken, ElementListNode, ElementNode, GrammarNode, HeaderNode, IdentifierToken, NameDeclarationNode, NameKeywordToken, NewlineToken, NumberToken, OptionalCommentNode, OptionalPropertyNode, PropertyOperatorToken, RegexToken, RuleBody, RuleDefinitionNode, RuleListNode, RuleNode, StartDeclarationNode, StartKeywordToken, StringToken, TokenPattern, TokenRuleNode, UnionMemberListNode, UnionOperatorToken, UnionRuleNode, VersionDeclarationNode, VersionKeywordToken, WhitespaceToken } from '../schema/index.js';

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
function stringifyNode(node: any, options: StringifierOptions): string {
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

/**
 * stringifier Identifier token
 * An identifier (node name, property name, etc.)
 */
function stringifyIdentifier(node: IdentifierToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier String token
 * A quoted string literal
 */
function stringifyString(node: StringToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier Regex token
 * A regular expression pattern
 */
function stringifyRegex(node: RegexToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier Number token
 * A numeric value
 */
function stringifyNumber(node: NumberToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier Comment token
 * A comment line starting with
 */
function stringifyComment(node: CommentToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier NameKeyword token
 * The "name:" keyword
 */
function stringifyNameKeyword(node: NameKeywordToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier VersionKeyword token
 * The "version:" keyword
 */
function stringifyVersionKeyword(node: VersionKeywordToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier StartKeyword token
 * The "start:" keyword
 */
function stringifyStartKeyword(node: StartKeywordToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier DefineOperator token
 * The "::" definition operator
 */
function stringifyDefineOperator(node: DefineOperatorToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier UnionOperator token
 * The "|" union operator
 */
function stringifyUnionOperator(node: UnionOperatorToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier PropertyOperator token
 * The ":" property assignment operator
 */
function stringifyPropertyOperator(node: PropertyOperatorToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier Whitespace token
 * Whitespace characters
 */
function stringifyWhitespace(node: WhitespaceToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier Newline token
 * Line break character
 */
function stringifyNewline(node: NewlineToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier Grammar deduction node
 * Complete BNF grammar definition
 */
function stringifyGrammar(node: GrammarNode, options: StringifierOptions): string {
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

/**
 * stringifier Header deduction node
 * Grammar header with metadata
 */
function stringifyHeader(node: HeaderNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: name (NameDeclaration)
  if (node.name) {
    parts.push(stringifyNode(node.name, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: version (VersionDeclaration)
  if (node.version) {
    parts.push(stringifyNode(node.version, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: start (StartDeclaration)
  if (node.start) {
    parts.push(stringifyNode(node.start, options));
  }

  return parts.join('');
}

/**
 * stringifier NameDeclaration deduction node
 * Grammar name declaration
 */
function stringifyNameDeclaration(node: NameDeclarationNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: NameKeyword
  parts.push(stringifyNode(node, options));
  // Property: value (Identifier)
  if (node.value) {
    parts.push(stringifyNode(node.value, options));
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

/**
 * stringifier VersionDeclaration deduction node
 * Grammar version declaration
 */
function stringifyVersionDeclaration(node: VersionDeclarationNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: VersionKeyword
  parts.push(stringifyNode(node, options));
  // Property: value (Identifier)
  if (node.value) {
    parts.push(stringifyNode(node.value, options));
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

/**
 * stringifier StartDeclaration deduction node
 * Grammar start rule declaration
 */
function stringifyStartDeclaration(node: StartDeclarationNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: StartKeyword
  parts.push(stringifyNode(node, options));
  // Property: value (Identifier)
  if (node.value) {
    parts.push(stringifyNode(node.value, options));
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

/**
 * stringifier RuleList deduction node
 * List of grammar rules
 */
function stringifyRuleList(node: RuleListNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: rules (Rule)
  if (node.rules) {
    parts.push(stringifyNode(node.rules, options));
  }

  return parts.join('');
}

/**
 * stringifier Rule deduction node
 * A single grammar rule definition
 */
function stringifyRule(node: RuleNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: comment (OptionalComment)
  if (node.comment) {
    parts.push(stringifyNode(node.comment, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: definition (RuleDefinition)
  if (node.definition) {
    parts.push(stringifyNode(node.definition, options));
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

/**
 * stringifier OptionalComment deduction node
 * Optional comment before rule
 */
function stringifyOptionalComment(node: OptionalCommentNode, options: StringifierOptions): string {
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

/**
 * stringifier RuleDefinition deduction node
 * Rule name and body definition
 */
function stringifyRuleDefinition(node: RuleDefinitionNode, options: StringifierOptions): string {
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

/**
 * stringifier TokenRule deduction node
 * Token rule with string or regex pattern
 */
function stringifyTokenRule(node: TokenRuleNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: pattern (TokenPattern)
  if (node.pattern) {
    parts.push(stringifyNode(node.pattern, options));
  }

  return parts.join('');
}

/**
 * stringifier DeductionRule deduction node
 * Deduction rule with sequence of elements
 */
function stringifyDeductionRule(node: DeductionRuleNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: sequence (ElementList)
  if (node.sequence) {
    parts.push(stringifyNode(node.sequence, options));
  }

  return parts.join('');
}

/**
 * stringifier UnionRule deduction node
 * Union rule with alternative choices
 */
function stringifyUnionRule(node: UnionRuleNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: members (UnionMemberList)
  if (node.members) {
    parts.push(stringifyNode(node.members, options));
  }

  return parts.join('');
}

/**
 * stringifier ElementList deduction node
 * Sequence of elements in a deduction rule
 */
function stringifyElementList(node: ElementListNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: elements (Element)
  if (node.elements) {
    parts.push(stringifyNode(node.elements, options));
  }

  return parts.join('');
}

/**
 * stringifier Element deduction node
 * Single element in a sequence
 */
function stringifyElement(node: ElementNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: node (Identifier)
  if (node.node) {
    parts.push(stringifyNode(node.node, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: property (OptionalProperty)
  if (node.property) {
    parts.push(stringifyNode(node.property, options));
  }

  return parts.join('');
}

/**
 * stringifier OptionalProperty deduction node
 * Optional property assignment
 */
function stringifyOptionalProperty(node: OptionalPropertyNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: PropertyOperator
  parts.push(stringifyNode(node, options));
  // Property: name (Identifier)
  if (node.name) {
    parts.push(stringifyNode(node.name, options));
  }

  return parts.join('');
}

/**
 * stringifier UnionMemberList deduction node
 * List of union members separated by |
 */
function stringifyUnionMemberList(node: UnionMemberListNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: first (Identifier)
  if (node.first) {
    parts.push(stringifyNode(node.first, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: rest (AdditionalMembers)
  if (node.rest) {
    parts.push(stringifyNode(node.rest, options));
  }

  return parts.join('');
}

/**
 * stringifier AdditionalMembers deduction node
 * Additional union members
 */
function stringifyAdditionalMembers(node: AdditionalMembersNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: UnionOperator
  parts.push(stringifyNode(node, options));
  // Property: member (Identifier)
  if (node.member) {
    parts.push(stringifyNode(node.member, options));
  }

  return parts.join('');
}

/**
 * stringifier TokenPattern union node
 * Either a string literal or regex pattern
 */
function stringifyTokenPattern(node: TokenPattern, options: StringifierOptions): string {
  // Union nodes delegate to their actual type
  return stringifyNode(node, options);
}

/**
 * stringifier RuleBody union node
 * Body of a rule - can be token, deduction, or union
 */
function stringifyRuleBody(node: RuleBody, options: StringifierOptions): string {
  // Union nodes delegate to their actual type
  return stringifyNode(node, options);
}

/**
 * Get indentation string based on options
 */
function getIndentation(options: StringifierOptions): string {
  const level = options.indent || 0;
  const indentStr = options.indentString || '  ';
  return indentStr.repeat(level);
}

/**
 * Add formatting whitespace if enabled
 */
function addWhitespace(parts: string[], options: StringifierOptions, type: 'space' | 'newline' = 'space'): void {
  if (options.format && options.includeWhitespace) {
    if (type === 'newline') {
      parts.push('\n');
    } else {
      parts.push(' ');
    }
  }
}

/**
 * Format token output with optional spacing
 */
function formatToken(value: string, options: StringifierOptions, context?: string): string {
  if (!options.format || !options.includeWhitespace) {
    return value;
  }

  // Add context-specific formatting rules here
  if (options.formatting?.spaceAround?.includes(value)) {
    return ` ${value} `;
  }

  return value;
}