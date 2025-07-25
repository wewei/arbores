# BNF Grammar Language Definition

This directory contains the BNF model definition for parsing our custom BNF notation format.

## Format Specification

Our BNF format follows this structure:

```bnf
name: GrammarName
version: 1.0.0
start: StartRuleName

# Description of the rule
RuleName :: definition

# Another rule description  
AnotherRule :: some other definition
```

### Grammar Header

Every BNF file starts with metadata:

- `name:` - The name of the grammar
- `version:` - Version number 
- `start:` - The name of the starting rule

### Rule Types

#### Token Rules

Define terminal symbols with string literals or regex patterns:

```bnf
# String literal
Plus :: '+'

# Regular expression
Number :: /\d+/
Identifier :: /[a-zA-Z_][a-zA-Z0-9_]*/
```

#### Deduction Rules

Define production rules with sequences of elements:

```bnf
# Simple sequence
BinaryExpression :: Expression Operator Expression

# With property assignments
BinaryExpression :: left:Expression operator:Operator right:Expression
```

Property assignments (`node:property`) specify how elements are assigned to properties in the AST.

#### Union Rules

Define alternative choices:

```bnf
# Simple union
Term :: Number | Identifier

# Multiple alternatives  
Operator :: Plus | Minus | Star | Slash
```

### Comments

Comments start with `#` and describe the purpose of each rule:

```bnf
# This is a comment describing the next rule
RuleName :: definition
```

## Files

- `syntax.bnf.ts` - TypeScript BNF model definition
- `examples/` - Example BNF grammar files
  - `simple-math.bnf` - Simple mathematical expressions
  - `bnf-grammar.bnf` - BNF format itself (meta-grammar)

## Usage

This BNF model can be used with the BNF parser system to:

1. Parse BNF grammar files into BNF models
2. Generate TypeScript types from BNF grammars
3. Generate PEG.js parsers from BNF grammars
4. Generate stringifiers for BNF-defined ASTs

## Next Steps

Future enhancements to consider:

- Repetition operators (`*`, `+`, `?`)
- Precedence and associativity annotations
- Nested rule definitions
- Import/include directives
- More sophisticated property mapping
