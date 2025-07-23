# String Case Conversion Utilities

This module provides utilities for converting between different string casing conventions, with special handling for consecutive uppercase letters (acronyms).

## Functions

### `toCamelCase(str: string): string`

Converts PascalCase strings to camelCase, with intelligent handling of consecutive uppercase letters.

**Features:**
- Converts single uppercase letters: `Identifier` → `identifier`
- Handles normal PascalCase: `StringLiteral` → `stringLiteral`
- Correctly processes consecutive uppercase letters (acronyms):
  - `JSDocCallbackTag` → `jsDocCallbackTag` (not `jSDocCallbackTag`)
  - `HTMLElement` → `htmlElement`
  - `XMLHttpRequest` → `xmlHttpRequest`
- Handles all-caps acronyms: `JSX` → `jsx`, `API` → `api`

### `toKebabCase(str: string): string`

Converts PascalCase/camelCase strings to kebab-case, with intelligent handling of consecutive uppercase letters.

**Features:**
- Converts basic cases: `StringLiteral` → `string-literal`
- Correctly processes consecutive uppercase letters:
  - `JSDoc` → `js-doc` (not `j-s-doc`)
  - `HTMLElement` → `html-element`
  - `XMLHttpRequest` → `xml-http-request`
- Handles all-caps acronyms: `JSX` → `jsx`, `API` → `api`

## Algorithm

Both functions use a sophisticated algorithm to detect and properly handle consecutive uppercase letters:

1. **Consecutive Uppercase Detection**: Identifies sequences of uppercase letters
2. **Boundary Analysis**: Determines where acronyms end and new words begin
3. **Smart Separation**: Keeps acronyms together while separating distinct words

## Usage

```typescript
import { toCamelCase, toKebabCase } from '../core/utils/string-case';

// camelCase conversion
const camelName = toCamelCase('JSDocCallbackTag'); // 'jsDocCallbackTag'

// kebab-case conversion  
const kebabName = toKebabCase('JSDocCallbackTag'); // 'js-doc-callback-tag'
```

## Testing

Comprehensive unit tests are available in `src/core/__tests__/string-case.test.ts`, covering:
- Basic conversions
- Consecutive uppercase letter handling
- Edge cases (empty strings, single characters, etc.)
- Real-world TypeScript SyntaxKind examples

Run tests with:
```bash
bun test src/core/__tests__/string-case.test.ts
```
