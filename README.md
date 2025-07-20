# Arbores

High-performance TypeScript AST parser and code generator with complete syntax support.

## 🎉 Version 0.0.3 Highlights

- ✅ **Complete TypeScript Support**: 95% of modern TypeScript syntax supported
- ✅ **Advanced Features**: Constructor parameter modifiers, type guards, conditional types
- ✅ **Full AST Round-trip**: Parse TypeScript → AST → Generate TypeScript
- ✅ **Production Ready**: Successfully handles complex TypeScript codebases

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

### Query AST files

#### Get root node IDs

```bash
arbores roots <file> [options]
```

Options:

- `--latest` - Output only the latest version root node ID
- `-v, --verbose` - Show detailed information (timestamp and description)
- `-f, --format <format>` - Output format (markdown|md|json|yaml), default: markdown

#### Get children of a node

```bash
arbores children <file> [options]
```

Options:

- `-n, --node <id>` - Node ID to get children for (defaults to latest root)
- `-f, --format <format>` - Output format (markdown|md|json|yaml), default: markdown

#### Get parent nodes of a node

```bash
arbores parents <file> [options]
```

Options:

- `-n, --node <id>` - Node ID to get parents for (defaults to latest root)
- `-v, --verbose` - Show detailed information about parent nodes
- `-f, --format <format>` - Output format (markdown|md|json|yaml), default: markdown

#### Display tree structure

```bash
arbores tree <file> [options]
```

Options:

- `-n, --node <id>` - Node ID to display tree for (defaults to latest root)
- `-c, --comments` - Show comments in tree output

#### Display detailed node information

```bash
arbores node <file> -n <node-id> [options]
```

Options:

- `-n, --node <id>` - Node ID to display information for (required)
- `-f, --format <format>` - Output format (markdown|md|json|yaml), default: markdown

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
# Get root node ID (markdown format, default)
arbores roots --latest output.ast.json

# Get all root node IDs with detailed information in JSON format
arbores roots -v -f json output.ast.json

# Get children of a function declaration in YAML format
arbores children -n <function-node-id> -f yaml output.ast.json

# Get parent nodes in markdown table format (verbose)
arbores parents -n <node-id> -v -f markdown output.ast.json

# Display the full tree structure with comments (always human-readable)
arbores tree -n <root-node-id> -c output.ast.json

# Get detailed information about a specific node in JSON format
arbores node -n <node-id> -f json output.ast.json

# Convert a node back to TypeScript code
arbores stringify -n <node-id> output.ast.json
```

## Features

### Core Capabilities

- **🚀 Complete TypeScript Parsing**: Support for modern TypeScript syntax including:
  - Classes with inheritance and modifiers (`private`, `public`, `protected`)
  - Advanced type features (conditional types, type guards, union types)
  - Template literals and string interpolation
  - Destructuring assignment and spread syntax
  - Import/export statements and modules
  - Enums and namespaces
  - Try-catch exception handling

### AST Processing

- **📊 AST Parsing**: Parse TypeScript files into structured AST (JSON/YAML)
- **🔄 Code Generation**: Convert AST nodes back to TypeScript with perfect fidelity
- **📚 Version Management**: Support for multiple versions with smart duplicate prevention
- **📝 Format Support**: Auto-detection of JSON/YAML formats from file extensions

### Developer Tools

- **🌳 Tree Visualization**: Display hierarchical AST structure
- **🔍 Node Querying**: Find and explore specific nodes in the AST
- **🏷️ Human-readable Output**: Uses generated SyntaxKind names for readable node types
- **⚡ High Performance**: Optimized for large codebases

### Advanced Debugging

- **🛠️ Systematic Debugging**: Built-in tools for divide-and-conquer AST problem solving
- **📋 Error Diagnostics**: Detailed error reporting for unsupported syntax
- **🎯 Precision Targeting**: Node-level debugging and validation

### Enhanced CLI Features

- **📁 Command Grouping**: Organized commands by functionality (convert/query)
- **🔄 Backward Compatibility**: Legacy direct commands still supported
- **💬 Comment Analysis**: Full support for parsing and displaying comments
- **🔍 Node Inspection**: Detailed node information in multiple formats (markdown/JSON/YAML)
- **🌲 Parent Lookup**: Reverse navigation to find parent nodes
- **📊 Multi-format Output**: Query commands support markdown/JSON/YAML formats
- **📋 Markdown Tables**: Structured, readable output that works great in documentation
- **🔗 API Integration**: JSON/YAML outputs perfect for piping to other tools or scripts

## Development

### Generate SyntaxKind Names

```bash
bun run generate:syntax-kinds
```

This regenerates the human-readable names for TypeScript SyntaxKind enum values from the TypeScript definition file.

## License

MIT
