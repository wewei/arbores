# SyntaxKind Group Visualization

```
Value Range Ruler:
0    50   100  150  200  250  300  350
|    |    |    |    |    |    |    |
[0-165] Tokens
[2-7] TriviaTokens
[9-15] LiteralTokens
 [15-18] TemplateTokens
 [19-79] PunctuationTokens
   [30-79] BinaryOperators
        [83-165] Keywords
           [119-127] FutureReservedWords
            [128-165] ContextualKeywords
                  [182-205] TypeNodes
                        [243-259] Statements
                              [309-351] JSDocNodes
                                [327-351] JSDocTags
```

## Group Details

### Tokens
- **Range**: 0 - 165
- **Count**: 165 members
- **Markers**: `FirstToken` → `LastToken`
- **Description**: Basic lexical tokens including EOF
- **Characteristics**: lexical, positioned, has-text

### TriviaTokens
- **Range**: 2 - 7
- **Count**: 6 members
- **Markers**: `FirstTriviaToken` → `LastTriviaToken`
- **Description**: Comments and whitespace tokens
- **Characteristics**: trivia, skippable, formatting

### LiteralTokens
- **Range**: 9 - 15
- **Count**: 7 members
- **Markers**: `FirstLiteralToken` → `LastLiteralToken`
- **Description**: Literal value tokens
- **Characteristics**: literal, has-value, typed

### TemplateTokens
- **Range**: 15 - 18
- **Count**: 4 members
- **Markers**: `FirstTemplateToken` → `LastTemplateToken`
- **Description**: Template string tokens
- **Characteristics**: template, literal, interpolation

### PunctuationTokens
- **Range**: 19 - 79
- **Count**: 61 members
- **Markers**: `FirstPunctuation` → `LastPunctuation`
- **Description**: Punctuation and operator tokens
- **Characteristics**: punctuation, operator, syntax

### BinaryOperators
- **Range**: 30 - 79
- **Count**: 50 members
- **Markers**: `FirstBinaryOperator` → `LastBinaryOperator`
- **Description**: Binary operator tokens
- **Characteristics**: binary-operator, expression, precedence

### Keywords
- **Range**: 83 - 165
- **Count**: 83 members
- **Markers**: `FirstKeyword` → `LastKeyword`
- **Description**: Reserved language keywords
- **Characteristics**: keyword, reserved, language

### FutureReservedWords
- **Range**: 119 - 127
- **Count**: 9 members
- **Markers**: `FirstFutureReservedWord` → `LastFutureReservedWord`
- **Description**: Future reserved words
- **Characteristics**: future-reserved, language, evolution

### ContextualKeywords
- **Range**: 128 - 165
- **Count**: 38 members
- **Markers**: `FirstContextualKeyword` → `LastContextualKeyword`
- **Description**: Context-dependent keywords
- **Characteristics**: contextual, keyword, conditional

### TypeNodes
- **Range**: 182 - 205
- **Count**: 24 members
- **Markers**: `FirstTypeNode` → `LastTypeNode`
- **Description**: TypeScript type system nodes
- **Characteristics**: type-system, compile-time, annotation

### Statements
- **Range**: 243 - 259
- **Count**: 17 members
- **Markers**: `FirstStatement` → `LastStatement`
- **Description**: Executable statement nodes
- **Characteristics**: statement, executable, control-flow

### JSDocNodes
- **Range**: 309 - 351
- **Count**: 44 members
- **Markers**: `FirstJSDocNode` → `LastJSDocNode`
- **Description**: JSDoc documentation nodes
- **Characteristics**: documentation, jsdoc, metadata

### JSDocTags
- **Range**: 327 - 351
- **Count**: 25 members
- **Markers**: `FirstJSDocTagNode` → `LastJSDocTagNode`
- **Description**: JSDoc tag nodes
- **Characteristics**: jsdoc-tag, documentation, structured
