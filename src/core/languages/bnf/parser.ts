/**
 * Parser generated from BNF model: BNFGrammar v1.0.0
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T03:15:19.150Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

// PEG.js grammar for BNFGrammar
export const GRAMMAR = `// Generated PEG.js grammar for BNFGrammar
// Version: 1.0.0

start = Grammar

_ "whitespace" = [ \t\n\r]*
__ "required whitespace" = [ \t\n\r]+

Grammar "Complete BNF grammar definition" = header:Header _ rules:RuleList
RuleList "List of grammar rules" = rules:Rule
Rule "A single grammar rule definition" = comment:OptionalComment _ definition:RuleDefinition _ newline:Newline
RuleDefinition "Rule name and body definition" = name:Identifier _ DefineOperator _ body:RuleBody
RuleBody "Body of a rule - can be token, deduction, or union" = TokenRule / DeductionRule / UnionRule
UnionRule "Union rule with alternative choices" = members:UnionMemberList
UnionMemberList "List of union members separated by |" = first:Identifier _ rest:AdditionalMembers
AdditionalMembers "Additional union members" = UnionOperator _ member:Identifier
DeductionRule "Deduction rule with sequence of elements" = sequence:ElementList
ElementList "Sequence of elements in a deduction rule" = elements:Element
Element "Single element in a sequence" = node:Identifier _ property:OptionalProperty
OptionalProperty "Optional property assignment" = PropertyOperator _ name:Identifier
TokenRule "Token rule with string or regex pattern" = pattern:TokenPattern
TokenPattern "Either a string literal or regex pattern" = String / Regex
OptionalComment "Optional comment before rule" = comment:Comment _ newline:Newline
Header "Grammar header with metadata" = name:NameDeclaration _ version:VersionDeclaration _ start:StartDeclaration
StartDeclaration "Grammar start rule declaration" = StartKeyword _ value:Identifier _ newline:Newline
VersionDeclaration "Grammar version declaration" = VersionKeyword _ value:Identifier _ newline:Newline
NameDeclaration "Grammar name declaration" = NameKeyword _ value:Identifier _ newline:Newline
Newline "Line break character" = [\\r?\\n]
Whitespace "Whitespace characters" = [[ \\t]+]
PropertyOperator "The ":" property assignment operator" = ":"
UnionOperator "The "|" union operator" = "|"
DefineOperator "The "::" definition operator" = "::"
StartKeyword "The "start:" keyword" = "start:"
VersionKeyword "The "version:" keyword" = "version:"
NameKeyword "The "name:" keyword" = "name:"
Comment "A comment line starting with" = [#[^\\n]*]
Number "A numeric value" = [\\d+(\\.\\d+)?]
Regex "A regular expression pattern" = [/([^/\\\\]|\\\\.)+/]
String "A quoted string literal" = ['([^'\\]|\\.)*']
Identifier "An identifier (node name, property name, etc.)" = [a-zA-Z_][a-zA-Z0-9_]*`;

// Parser statistics
export const PARSER_STATS = {
  "totalRules": 32,
  "tokenRules": 13,
  "deductionRules": 17,
  "unionRules": 2,
  "leftRecursiveRules": []
} as const;

/**
 * Parse input text using the generated PEG.js grammar
 * 
 * Note: This requires PEG.js to be installed and the grammar to be compiled.
 * Run: npx pegjs --output parser-compiled.js <grammar-file>
 * 
 * @param input - The input text to parse
 * @returns The parsed AST
 */
export function parse(input: string): any {
  throw new Error('Parser not compiled. Please compile the PEG.js grammar first.');
}

/**
 * Get the raw PEG.js grammar string
 */
export function getGrammar(): string {
  return GRAMMAR;
}
