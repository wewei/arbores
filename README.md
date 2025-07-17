# Arbores

TypeScript AST parser and query tool

## Installation

```bash
npm install -g arbores
```

## Usage

### Parse TypeScript files to AST JSON

```bash
arbores parse <file> [options]
```

Options:
- `-f, --file <output>` - Output JSON file path
- `-n, --dry-run` - Dry run mode (only output to stdout)
- `-d, --description <desc>` - Version description

### Convert AST nodes back to TypeScript code

```bash
arbores stringify <file> <node-id> [options]
```

Options:
- `-f, --format <format>` - Output format (compact|readable|minified), default: readable

### Query AST JSON files

#### Get root node IDs

```bash
arbores root <file> [options]
```

Options:
- `--latest` - Output only the latest version root node ID

Examples:
```bash
# Get all root node IDs
arbores root test.ast.json

# Get only the latest version root node ID
arbores root test.ast.json --latest
```

#### Get children of a node

```bash
arbores child <file> <node-id>
```

Outputs children as "id: human readable kind"

Example:
```bash
arbores child test.ast.json b8871ff790a6d157
```

#### Display tree structure

```bash
arbores tree <file> <node-id>
```

Displays the descendants of a node as a tree, each node showing "id: human readable kind"

Example:
```bash
arbores tree test.ast.json 0bfd2a4021b7ad99
```

## Examples

### Parse a TypeScript file

```bash
arbores parse src/main.ts -f output.ast.json
```

### Query the AST

```bash
# Get root node ID
arbores root output.ast.json --latest

# Get children of a function declaration
arbores child output.ast.json <function-node-id>

# Display the full tree structure
arbores tree output.ast.json <root-node-id>
```

## Features

- **AST Parsing**: Parse TypeScript files into structured AST JSON
- **Version Management**: Support for multiple versions of the same file
- **Human-readable Output**: Uses generated SyntaxKind names for readable node types
- **Tree Visualization**: Display hierarchical AST structure
- **Node Querying**: Find and explore specific nodes in the AST
- **Code Generation**: Convert AST nodes back to TypeScript code

## Development

### Generate SyntaxKind Names

```bash
bun run generate:syntax-kinds
```

This regenerates the human-readable names for TypeScript SyntaxKind enum values from the TypeScript definition file.

## License

MIT
