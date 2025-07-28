# ListNode Support Documentation

## Overview

The BNF model system now supports `ListNode` for representing sequences of items with optional separators. This is useful for modeling language constructs like parameter lists, statement sequences, array elements, etc.

## ListNode Definition

```typescript
interface ListNode extends BaseNode {
  type: 'list';
  item: string;     // Name of the item node type
  separator?: {
    node: string;   // Name of the separator node type
    last:
      | 'required'  // The separator after the last item is required
      | 'optional'  // The separator after the last item is optional
      | 'none';     // The last item must not have a separator
  };
}
```

## Example Usage

### Simple Parameter List

```yaml
name: ParameterListExample
version: 1.0.0
start: FunctionDeclaration

nodes:
  FunctionDeclaration:
    type: deduction
    description: Function declaration with parameter list
    sequence:
      - node: Identifier
        prop: name
      - "("
      - node: ParameterList
        prop: parameters
      - ")"

  ParameterList:
    type: list
    description: List of function parameters
    item: Parameter
    separator:
      node: Comma
      last: none  # No comma after last parameter

  Parameter:
    type: deduction
    description: Function parameter
    sequence:
      - node: Identifier
        prop: name
      - ":"
      - node: TypeName
        prop: type

  Identifier:
    type: token
    description: Variable identifier
    pattern:
      regex: "[a-zA-Z][a-zA-Z0-9]*"

  TypeName:
    type: token
    description: Type name
    pattern:
      regex: "[A-Z][a-zA-Z0-9]*"

  Comma:
    type: token
    description: Parameter separator
    pattern: ","
```

### Generated Schema

The schema generator will create:

```typescript
// nodes/ParameterList.ts
export interface ParameterListNode {
  readonly type: 'ParameterList';
  readonly items: ParameterNode[];
  readonly separators: CommaToken[]; // One fewer than items
}
```

### Generated Stringifier

The stringifier generator will create:

```typescript
// stringifier/nodes/ParameterList.ts
export function stringifyParameterList(node: ParameterListNode, options: StringifierOptions): string {
  const parts: string[] = [];
  
  for (let i = 0; i < node.items.length; i++) {
    parts.push(stringifyNode(node.items[i], options));
    
    if (node.separators && i < node.separators.length) {
      // Only add separator if not the last item
      if (i < node.items.length - 1) {
        parts.push(stringifyNode(node.separators[i], options));
      }
    }
  }

  return parts.join('');
}
```

## Separator Behaviors

### `last: 'none'`
No separator after the last item. Common for parameter lists, array elements.
```
item1, item2, item3  // No comma after item3
```

### `last: 'optional'`
Separator after last item is optional. Common for JavaScript object literals.
```
item1, item2, item3,  // Optional comma after item3
```

### `last: 'required'`
Separator after last item is required. Less common but useful for some languages.
```
item1; item2; item3;  // Required semicolon after item3
```

## Integration

ListNode support is automatically included in:

- ✅ Schema generator - generates TypeScript interfaces
- ✅ Stringifier generator - generates stringification functions  
- ✅ Union types - included in `*Node` union types
- ✅ Index files - properly exported
- 🔄 PEG generator - TODO: add list parsing rules
- 🔄 Parser wrapper - TODO: handle list node parsing

## Benefits

1. **Type Safety**: Generated interfaces ensure correct structure
2. **Automatic Stringification**: No manual string building needed
3. **Separator Logic**: Handles complex separator placement automatically
4. **Composable**: Lists can contain any node type (tokens, deductions, unions, other lists)
5. **Flexible**: Supports different separator behaviors for various use cases
