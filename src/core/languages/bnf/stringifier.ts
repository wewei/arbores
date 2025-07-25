/**
 * stringifier functions for BNFGrammar grammar
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-25T09:51:40.635Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import type { AdditionalMembersNode, CommentToken, DeductionRuleNode, DefineOperatorToken, ElementListNode, ElementNode, GrammarNode, HeaderNode, IdentifierToken, NameDeclarationNode, NameKeywordToken, NewlineToken, NumberToken, OptionalCommentNode, OptionalPropertyNode, PropertyOperatorToken, RegexToken, RuleBody, RuleDefinitionNode, RuleListNode, RuleNode, StartDeclarationNode, StartKeywordToken, StringToken, TokenPattern, TokenRuleNode, UnionMemberListNode, UnionOperatorToken, UnionRuleNode, VersionDeclarationNode, VersionKeywordToken, WhitespaceToken } from './index.js';

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
 * Main stringifier function for BNFGrammar nodes
 */
export function stringifierBNFGrammar(node: GrammarNode, options: StringifierOptions = {}): string {
  const opts = {
    indent: 0,
    indentString: '  ',
    includeWhitespace: true,
    format: true,
    ...options,
  };

  return stringifierNode(node, opts);
}

/**
 * Generic node stringifier function that dispatches to specific node types
 */
function stringifierNode(node: any, options: StringifierOptions): string {
  if (!node || typeof node !== 'object' || !node.type) {
    throw new Error('Invalid node: must have a type property');
  }

  switch (node.type) {
    case 'Identifier':
      return stringifierIdentifier(node, options);
    case 'String':
      return stringifierString(node, options);
    case 'Regex':
      return stringifierRegex(node, options);
    case 'Number':
      return stringifierNumber(node, options);
    case 'Comment':
      return stringifierComment(node, options);
    case 'NameKeyword':
      return stringifierNameKeyword(node, options);
    case 'VersionKeyword':
      return stringifierVersionKeyword(node, options);
    case 'StartKeyword':
      return stringifierStartKeyword(node, options);
    case 'DefineOperator':
      return stringifierDefineOperator(node, options);
    case 'UnionOperator':
      return stringifierUnionOperator(node, options);
    case 'PropertyOperator':
      return stringifierPropertyOperator(node, options);
    case 'Whitespace':
      return stringifierWhitespace(node, options);
    case 'Newline':
      return stringifierNewline(node, options);
    case 'Grammar':
      return stringifierGrammar(node, options);
    case 'Header':
      return stringifierHeader(node, options);
    case 'NameDeclaration':
      return stringifierNameDeclaration(node, options);
    case 'VersionDeclaration':
      return stringifierVersionDeclaration(node, options);
    case 'StartDeclaration':
      return stringifierStartDeclaration(node, options);
    case 'RuleList':
      return stringifierRuleList(node, options);
    case 'Rule':
      return stringifierRule(node, options);
    case 'OptionalComment':
      return stringifierOptionalComment(node, options);
    case 'RuleDefinition':
      return stringifierRuleDefinition(node, options);
    case 'TokenRule':
      return stringifierTokenRule(node, options);
    case 'DeductionRule':
      return stringifierDeductionRule(node, options);
    case 'UnionRule':
      return stringifierUnionRule(node, options);
    case 'ElementList':
      return stringifierElementList(node, options);
    case 'Element':
      return stringifierElement(node, options);
    case 'OptionalProperty':
      return stringifierOptionalProperty(node, options);
    case 'UnionMemberList':
      return stringifierUnionMemberList(node, options);
    case 'AdditionalMembers':
      return stringifierAdditionalMembers(node, options);
    case 'TokenPattern':
      return stringifierTokenPattern(node, options);
    case 'RuleBody':
      return stringifierRuleBody(node, options);
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

/**
 * stringifier Identifier token
 * An identifier (node name, property name, etc.)
 */
function stringifierIdentifier(node: IdentifierToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier String token
 * A quoted string literal
 */
function stringifierString(node: StringToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier Regex token
 * A regular expression pattern
 */
function stringifierRegex(node: RegexToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier Number token
 * A numeric value
 */
function stringifierNumber(node: NumberToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier Comment token
 * A comment line starting with
 */
function stringifierComment(node: CommentToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier NameKeyword token
 * The "name:" keyword
 */
function stringifierNameKeyword(node: NameKeywordToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier VersionKeyword token
 * The "version:" keyword
 */
function stringifierVersionKeyword(node: VersionKeywordToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier StartKeyword token
 * The "start:" keyword
 */
function stringifierStartKeyword(node: StartKeywordToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier DefineOperator token
 * The "::" definition operator
 */
function stringifierDefineOperator(node: DefineOperatorToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier UnionOperator token
 * The "|" union operator
 */
function stringifierUnionOperator(node: UnionOperatorToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier PropertyOperator token
 * The ":" property assignment operator
 */
function stringifierPropertyOperator(node: PropertyOperatorToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier Whitespace token
 * Whitespace characters
 */
function stringifierWhitespace(node: WhitespaceToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier Newline token
 * Line break character
 */
function stringifierNewline(node: NewlineToken, options: StringifierOptions): string {
  return node.value;
}

/**
 * stringifier Grammar deduction node
 * Complete BNF grammar definition
 */
function stringifierGrammar(node: GrammarNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: header (Header)
  if (node.header) {
    parts.push(stringifierNode(node.header, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: rules (RuleList)
  if (node.rules) {
    parts.push(stringifierNode(node.rules, options));
  }

  return parts.join('');
}

/**
 * stringifier Header deduction node
 * Grammar header with metadata
 */
function stringifierHeader(node: HeaderNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: name (NameDeclaration)
  if (node.name) {
    parts.push(stringifierNode(node.name, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: version (VersionDeclaration)
  if (node.version) {
    parts.push(stringifierNode(node.version, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: start (StartDeclaration)
  if (node.start) {
    parts.push(stringifierNode(node.start, options));
  }

  return parts.join('');
}

/**
 * stringifier NameDeclaration deduction node
 * Grammar name declaration
 */
function stringifierNameDeclaration(node: NameDeclarationNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: NameKeyword
  parts.push(stringifierNode(node, options));
  // Property: value (Identifier)
  if (node.value) {
    parts.push(stringifierNode(node.value, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: newline (Newline)
  if (node.newline) {
    parts.push(stringifierNode(node.newline, options));
  }

  return parts.join('');
}

/**
 * stringifier VersionDeclaration deduction node
 * Grammar version declaration
 */
function stringifierVersionDeclaration(node: VersionDeclarationNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: VersionKeyword
  parts.push(stringifierNode(node, options));
  // Property: value (Identifier)
  if (node.value) {
    parts.push(stringifierNode(node.value, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: newline (Newline)
  if (node.newline) {
    parts.push(stringifierNode(node.newline, options));
  }

  return parts.join('');
}

/**
 * stringifier StartDeclaration deduction node
 * Grammar start rule declaration
 */
function stringifierStartDeclaration(node: StartDeclarationNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: StartKeyword
  parts.push(stringifierNode(node, options));
  // Property: value (Identifier)
  if (node.value) {
    parts.push(stringifierNode(node.value, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: newline (Newline)
  if (node.newline) {
    parts.push(stringifierNode(node.newline, options));
  }

  return parts.join('');
}

/**
 * stringifier RuleList deduction node
 * List of grammar rules
 */
function stringifierRuleList(node: RuleListNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: rules (Rule)
  if (node.rules) {
    parts.push(stringifierNode(node.rules, options));
  }

  return parts.join('');
}

/**
 * stringifier Rule deduction node
 * A single grammar rule definition
 */
function stringifierRule(node: RuleNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: comment (OptionalComment)
  if (node.comment) {
    parts.push(stringifierNode(node.comment, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: definition (RuleDefinition)
  if (node.definition) {
    parts.push(stringifierNode(node.definition, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: newline (Newline)
  if (node.newline) {
    parts.push(stringifierNode(node.newline, options));
  }

  return parts.join('');
}

/**
 * stringifier OptionalComment deduction node
 * Optional comment before rule
 */
function stringifierOptionalComment(node: OptionalCommentNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: comment (Comment)
  if (node.comment) {
    parts.push(stringifierNode(node.comment, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: newline (Newline)
  if (node.newline) {
    parts.push(stringifierNode(node.newline, options));
  }

  return parts.join('');
}

/**
 * stringifier RuleDefinition deduction node
 * Rule name and body definition
 */
function stringifierRuleDefinition(node: RuleDefinitionNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: name (Identifier)
  if (node.name) {
    parts.push(stringifierNode(node.name, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Token reference: DefineOperator
  parts.push(stringifierNode(node, options));
  // Property: body (RuleBody)
  if (node.body) {
    parts.push(stringifierNode(node.body, options));
  }

  return parts.join('');
}

/**
 * stringifier TokenRule deduction node
 * Token rule with string or regex pattern
 */
function stringifierTokenRule(node: TokenRuleNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: pattern (TokenPattern)
  if (node.pattern) {
    parts.push(stringifierNode(node.pattern, options));
  }

  return parts.join('');
}

/**
 * stringifier DeductionRule deduction node
 * Deduction rule with sequence of elements
 */
function stringifierDeductionRule(node: DeductionRuleNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: sequence (ElementList)
  if (node.sequence) {
    parts.push(stringifierNode(node.sequence, options));
  }

  return parts.join('');
}

/**
 * stringifier UnionRule deduction node
 * Union rule with alternative choices
 */
function stringifierUnionRule(node: UnionRuleNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: members (UnionMemberList)
  if (node.members) {
    parts.push(stringifierNode(node.members, options));
  }

  return parts.join('');
}

/**
 * stringifier ElementList deduction node
 * Sequence of elements in a deduction rule
 */
function stringifierElementList(node: ElementListNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: elements (Element)
  if (node.elements) {
    parts.push(stringifierNode(node.elements, options));
  }

  return parts.join('');
}

/**
 * stringifier Element deduction node
 * Single element in a sequence
 */
function stringifierElement(node: ElementNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: node (Identifier)
  if (node.node) {
    parts.push(stringifierNode(node.node, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: property (OptionalProperty)
  if (node.property) {
    parts.push(stringifierNode(node.property, options));
  }

  return parts.join('');
}

/**
 * stringifier OptionalProperty deduction node
 * Optional property assignment
 */
function stringifierOptionalProperty(node: OptionalPropertyNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: PropertyOperator
  parts.push(stringifierNode(node, options));
  // Property: name (Identifier)
  if (node.name) {
    parts.push(stringifierNode(node.name, options));
  }

  return parts.join('');
}

/**
 * stringifier UnionMemberList deduction node
 * List of union members separated by |
 */
function stringifierUnionMemberList(node: UnionMemberListNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Property: first (Identifier)
  if (node.first) {
    parts.push(stringifierNode(node.first, options));
  }
  if (options.format && options.includeWhitespace) {
    parts.push(' ');
  }
  // Property: rest (AdditionalMembers)
  if (node.rest) {
    parts.push(stringifierNode(node.rest, options));
  }

  return parts.join('');
}

/**
 * stringifier AdditionalMembers deduction node
 * Additional union members
 */
function stringifierAdditionalMembers(node: AdditionalMembersNode, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
  // Token reference: UnionOperator
  parts.push(stringifierNode(node, options));
  // Property: member (Identifier)
  if (node.member) {
    parts.push(stringifierNode(node.member, options));
  }

  return parts.join('');
}

/**
 * stringifier TokenPattern union node
 * Either a string literal or regex pattern
 */
function stringifierTokenPattern(node: TokenPattern, options: StringifierOptions): string {
  // Union nodes delegate to their actual type
  return stringifierNode(node, options);
}

/**
 * stringifier RuleBody union node
 * Body of a rule - can be token, deduction, or union
 */
function stringifierRuleBody(node: RuleBody, options: StringifierOptions): string {
  // Union nodes delegate to their actual type
  return stringifierNode(node, options);
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