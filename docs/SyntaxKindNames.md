# SyntaxKind Names

This module provides human-readable names for TypeScript's `SyntaxKind` enum values. The names are automatically generated from the TypeScript definition file to ensure accuracy and completeness.

## Overview

TypeScript's AST nodes have a `kind` property that contains a numeric value from the `SyntaxKind` enum. This module provides functions to convert these numeric values into human-readable string names.

## Generated Files

- `src/syntax-kind-names.ts` - Main TypeScript module with functions
- `src/syntax-kind-names.json` - JSON reference file with all mappings

## API

### `getSyntaxKindName(kind: number): string`

Converts a SyntaxKind numeric value to its human-readable name.

```typescript
import { getSyntaxKindName } from './src/syntax-kind-names';

console.log(getSyntaxKindName(262)); // "FunctionDeclaration"
console.log(getSyntaxKindName(80));  // "Identifier"
console.log(getSyntaxKindName(999)); // "Unknown" (for invalid values)
```

### `SYNTAX_KIND_NAMES: Record<number, string>`

A complete mapping of all SyntaxKind values to their names.

```typescript
import { SYNTAX_KIND_NAMES } from './src/syntax-kind-names';

console.log(SYNTAX_KIND_NAMES[262]); // "FunctionDeclaration"
```

### `getAllSyntaxKindNames(): string[]`

Returns an array of all SyntaxKind names.

```typescript
import { getAllSyntaxKindNames } from './src/syntax-kind-names';

const names = getAllSyntaxKindNames();
console.log(names.length); // 358
```

### `getAllSyntaxKindValues(): number[]`

Returns an array of all SyntaxKind numeric values.

```typescript
import { getAllSyntaxKindValues } from './src/syntax-kind-names';

const values = getAllSyntaxKindValues();
console.log(values.length); // 358
```

## Usage Examples

### Basic Usage

```typescript
import { getSyntaxKindName } from './src/syntax-kind-names';
import * as ts from 'typescript';

const sourceFile = ts.createSourceFile(
  'test.ts',
  'function hello() { return "world"; }',
  ts.ScriptTarget.Latest,
  true
);

function visitNode(node: ts.Node) {
  const kindName = getSyntaxKindName(node.kind);
  console.log(`${kindName}: ${node.getText()}`);
  
  ts.forEachChild(node, visitNode);
}

visitNode(sourceFile);
```

### Finding Specific Node Types

```typescript
import { getSyntaxKindName } from './src/syntax-kind-names';
import * as ts from 'typescript';

function findFunctions(sourceFile: ts.SourceFile) {
  const functions: ts.FunctionDeclaration[] = [];
  
  function visitNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
      functions.push(node as ts.FunctionDeclaration);
    }
    ts.forEachChild(node, visitNode);
  }
  
  visitNode(sourceFile);
  return functions;
}
```

### Debugging AST Structure

```typescript
import { getSyntaxKindName } from './src/syntax-kind-names';
import * as ts from 'typescript';

function debugAST(node: ts.Node, depth: number = 0) {
  const indent = '  '.repeat(depth);
  const kindName = getSyntaxKindName(node.kind);
  const text = node.getText().substring(0, 30);
  
  console.log(`${indent}${kindName} (${node.kind}): "${text}..."`);
  
  ts.forEachChild(node, child => debugAST(child, depth + 1));
}
```

## Regenerating the Names

The syntax kind names are automatically generated from the TypeScript definition file. To regenerate them:

```bash
bun run generate:syntax-kinds
```

Or manually:

```bash
bun run scripts/generate-syntax-kind-names.ts
```

## Implementation Details

The generator script:

1. Reads the TypeScript definition file (`node_modules/typescript/lib/typescript.d.ts`)
2. Uses TypeScript's compiler API to parse the file
3. Extracts all enum members from the `SyntaxKind` enum
4. Generates a TypeScript module with the mapping functions
5. Also creates a JSON reference file

This ensures that the names are always up-to-date with the current TypeScript version and includes all enum members, including constants like `FirstToken`, `LastToken`, etc.

## Common SyntaxKind Values

Here are some commonly used SyntaxKind values:

| Value | Name | Description |
|-------|------|-------------|
| 0 | Unknown | Unknown syntax kind |
| 1 | EndOfFileToken | End of file token |
| 9 | NumericLiteral | Numeric literal |
| 11 | StringLiteral | String literal |
| 80 | Identifier | Identifier |
| 86 | ClassKeyword | `class` keyword |
| 100 | FunctionKeyword | `function` keyword |
| 166 | QualifiedName | Qualified name (e.g., `namespace.name`) |
| 209 | ArrayLiteralExpression | Array literal expression |
| 213 | CallExpression | Function call expression |
| 226 | BinaryExpression | Binary expression (e.g., `a + b`) |
| 243 | VariableStatement | Variable declaration statement |
| 262 | FunctionDeclaration | Function declaration |
| 263 | ClassDeclaration | Class declaration |
| 307 | SourceFile | Source file node |

## Notes

- The function returns `"Unknown"` for any numeric value that doesn't correspond to a valid SyntaxKind
- All 358 SyntaxKind values are included in the mapping
- The names are exactly as they appear in the TypeScript definition file
- The mapping includes both regular enum members and constants like `FirstToken`, `LastToken`, etc. 