# TypeScript SyntaxKind Analysis

## Overview

TypeScript's `SyntaxKind` enum organizes syntax elements into logical groups using boundary markers. Understanding these groups is crucial for effective AST schema design.

## Boundary Marker Pattern

TypeScript uses a consistent pattern for marking group boundaries:

- **FirstXxx**: Marks the beginning of a group
- **LastXxx**: Marks the end of a group  
- **Count**: Total number of syntax kinds

## Major Groups

### Token Groups

#### Basic Tokens (0-82)
- `FirstToken` (0) → `EndOfFileToken` (1)
- `FirstTriviaToken` (2) → `LastTriviaToken` (7) - Comments, whitespace
- `FirstLiteralToken` (9) → `NoSubstitutionTemplateLiteral` (14) - Literals
- `FirstTemplateToken` (15) → `LastTemplateToken` (18) - Template strings
- `FirstPunctuation` (19) → `CaretEqualsToken` (78) - Operators, punctuation
- `FirstBinaryOperator` (30) → `LastBinaryOperator` (79) - Binary operators subset

#### Keywords (83-165)
- `FirstKeyword` (83) → `LastKeyword` (117) - Reserved words (break, case, etc.)
- `FirstFutureReservedWord` (119) → `LastFutureReservedWord` (127) - Future keywords
- `FirstContextualKeyword` (128) → `LastContextualKeyword` (165) - Context-dependent keywords

### Node Groups (166+)

#### Core Nodes (166-181)
- `FirstNode` (166) - Beginning of actual AST nodes
- Basic declarations and signatures

#### Type Nodes (182-205)  
- `FirstTypeNode` (182) → `LastTypeNode` (205)
- Type references, function types, union types, etc.
- Critical for TypeScript's type system representation

#### Statements (243-259)
- `FirstStatement` (243) → `LastStatement` (259)
- All statement types (if, for, while, etc.)

#### JSDoc Nodes (309-351)
- `FirstJSDocNode` (309) → `LastJSDocNode` (351)
- `FirstJSDocTagNode` (327) → `LastJSDocTagNode` (351)
- Documentation-related nodes

## Group Characteristics

### Shared Properties by Group

1. **Token Groups**: Represent lexical elements, typically have `text` property
2. **Type Nodes**: Represent TypeScript type information, used in type checking
3. **Statement Nodes**: Represent executable code blocks, have control flow implications
4. **Declaration Nodes**: Define entities (variables, functions, classes)
5. **Expression Nodes**: Represent values and computations

### Common Node Properties by Group

```typescript
// Token nodes typically have:
interface TokenLike {
  kind: SyntaxKind;
  text?: string;
  pos: number;
  end: number;
}

// Type nodes typically have:
interface TypeNodeLike extends NodeLike {
  kind: TypeSyntaxKind;
  // type-specific properties
}

// Statement nodes typically have:
interface StatementLike extends NodeLike {
  kind: StatementSyntaxKind;
  // May have labels, modifiers
}
```

## Schema Design Implications

### Group-Based Schema Organization

1. **Separate schemas per major group**
   - `token-schema.json` - All token types
   - `type-node-schema.json` - Type system nodes  
   - `statement-schema.json` - Statement nodes
   - `expression-schema.json` - Expression nodes

2. **Shared base schemas**
   - `base-node-schema.json` - Common node properties
   - `positioned-schema.json` - Position information

3. **Inheritance patterns**
   - Group schemas extend base schemas
   - Specific node types extend group schemas

### Naming Conventions

- Schema files: `{group}-schema.json`
- Generated types: `{Group}Node`, `{Specific}Node`
- Type guards: `is{Group}Node()`, `is{Specific}Node()`

## Implementation Priority

### Phase 1: Core Groups
1. Token analysis and schema
2. Basic node structure
3. Type node schema (most complex)

### Phase 2: Advanced Groups  
1. Statement and expression schemas
2. Declaration schemas
3. JSDoc schema (if needed)

### Phase 3: Specialized
1. JSX nodes (if supporting React)
2. Module system nodes
3. Advanced TypeScript features

## Tools Needed

1. **SyntaxKind Analyzer**: Extract boundary markers and generate group mappings
2. **Schema Generator**: Create JSON schemas based on group analysis
3. **Type Generator**: Generate TypeScript types from schemas
4. **Validator**: Ensure schema coverage and correctness

---

*This analysis forms the foundation for our data-driven AST schema generation approach.*
