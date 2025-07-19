# Arbores

TypeScript AST parser and query tool

## Installation

```bash
npm install -g arbores
```

## Usage

### Parse TypeScript files to AST

```bash
arbores parse <file> [options]
```

Options:
- `-a, --ast <path>` - Output AST file path (format auto-detected from extension)
- `-f, --format <format>` - Output format (json|yaml|yml) - overrides extension detection
- `-d, --dry-run` - Dry run mode (only output to stdout)
- `-O, --override` - Override/write to AST file (required when using -a)
- `-D, --description <desc>` - Version description

### Convert AST nodes back to TypeScript code

```bash
arbores stringify <file> [options]
```

Options:

- `-n, --node <id>` - Node ID to stringify (defaults to latest root)
- `-f, --format <format>` - Output format (compact|readable|minified), default: readable

### Query AST JSON files

#### Get root node IDs

```bash
arbores roots <file> [options]
```

Options:

- `--latest` - Output only the latest version root node ID
- `-v, --verbose` - Show detailed information (timestamp and description)

Examples:

```bash
# Get all root node IDs (simple format)
arbores roots test.ast.json

# Get all root node IDs with detailed information
arbores roots -v test.ast.json

# Get only the latest version root node ID
arbores roots --latest test.ast.json
```

#### Get children of a node

```bash
arbores children <file> [options]
```

Options:

- `-n, --node <id>` - Node ID to get children for (defaults to latest root)

Outputs children as "id: human readable kind"

Examples:

```bash
# Get children of a specific node
arbores children -n b8871ff790a6d157 test.ast.json

# Get children of the latest root node
arbores children test.ast.json
```

#### Display tree structure

```bash
arbores tree <file> [options]
```

Options:

- `-n, --node <id>` - Node ID to display tree for (defaults to latest root)

Displays the descendants of a node as a tree, each node showing "id: human readable kind"

Example:

```bash
arbores tree -n 0bfd2a4021b7ad99 test.ast.json
```

## Examples

### Parse a TypeScript file

```bash
# Parse to JSON format
arbores parse -O -a output.ast.json src/main.ts

# Parse to YAML format  
arbores parse -O -a output.ast.yaml src/main.ts

# Parse with description
arbores parse -O -a output.ast.json -D "Initial version" src/main.ts
```

### Query the AST

```bash
# Get root node ID
arbores roots --latest output.ast.json

# Get children of a function declaration
arbores children -n <function-node-id> output.ast.json

# Display the full tree structure
arbores tree -n <root-node-id> output.ast.json

# Convert a node back to TypeScript code
arbores stringify -n <node-id> output.ast.json
```

## Features

- **AST Parsing**: Parse TypeScript files into structured AST (JSON/YAML)
- **Version Management**: Support for multiple versions with smart duplicate prevention
- **Format Support**: Auto-detection of JSON/YAML formats from file extensions
- **Human-readable Output**: Uses generated SyntaxKind names for readable node types
- **Tree Visualization**: Display hierarchical AST structure
- **Node Querying**: Find and explore specific nodes in the AST
- **Code Generation**: Convert AST nodes back to TypeScript code with full type information
- **Type Annotations**: Complete support for TypeScript type annotations and keywords

## Development

### Generate SyntaxKind Names

```bash
bun run generate:syntax-kinds
```

This regenerates the human-readable names for TypeScript SyntaxKind enum values from the TypeScript definition file.

## License

MIT
