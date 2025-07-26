// Generated PEG.js grammar for BNFGrammar
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
Identifier "An identifier (node name, property name, etc.)" = [a-zA-Z_][a-zA-Z0-9_]*