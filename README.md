# Arbores - TypeScript AST 工具项目

高性能的 TypeScript AST 处理和转换工具，提供完整的语法支持和代码生成能力。

## 🎉 最新进展

- ✅ **核心 AST 处理** - 完整的 TypeScript 解析、查询和字符串化功能
- ✅ **命令行工具** - 模块化的 CLI 命令结构
- ✅ **语法分析增强** - 基于 YAML 的 SyntaxKind 数据管理
- ✅ **测试完善** - 162 项测试通过，包括往返一致性测试
- 🚧 **BNF 模型系统** - 正在开发基于 BNF 的语法规则建模
- 🚧 **类型化转换器** - ts.Node 到 BNF 语法树的转换能力

## 🏗️ Architecture

Arbores follows a clean, layered architecture:

```
src/
├── core/                    # Core API Layer (Pure Functions)
│   ├── parser.ts           # parseCode() - Parse TypeScript to AST
│   ├── query.ts            # getRoots(), getNode(), getChildren(), getParents()
│   ├── stringify.ts        # stringifyNode() - Generate TypeScript from AST
│   ├── types.ts            # Result<T>, ArborError, and core types
│   └── ast-builder/        # AST node builders
├── cli/                    # CLI Adapter Layer
│   ├── commands/           # Modular CLI commands
│   │   ├── parse.ts        # Parse command
│   │   ├── stringify.ts    # Stringify command
│   │   ├── roots.ts        # Roots query
│   │   ├── children.ts     # Children query
│   │   ├── parents.ts      # Parents query
│   │   ├── tree.ts         # Tree visualization
│   │   └── node.ts         # Node details
│   └── utils.ts            # CLI utilities
```

### Design Principles

- **Functional无状态**: All core APIs are pure functions
- **统一错误处理**: Result type for type-safe error handling
- **数据存储外置**: No state management in core layer
- **适配器模式**: CLI layer adapts core APIs to command-line interface

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
  - Constructor parameter modifiers

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

## Core API (Node.js)

The core layer provides pure functions for programmatic use:

```typescript
import { parseCode, getRoots, getNode, stringifyNode } from 'arbores/core';

// Parse TypeScript code to AST
const result = parseCode(sourceCode, baseAST);
if (result.success) {
  const ast = result.data;
  
  // Get root nodes
  const roots = getRoots(ast);
  
  // Get specific node
  const node = getNode(ast, nodeId);
  
  // Generate TypeScript code
  const code = stringifyNode(ast, nodeId);
}
```

## Development

### Project Structure

```
arbores/
├── src/
│   ├── core/              # Core API layer (pure functions)
│   │   ├── parser.ts      # parseCode()
│   │   ├── query.ts       # getRoots(), getNode(), etc.
│   │   ├── stringify.ts   # stringifyNode()
│   │   ├── types.ts       # Result<T>, ArborError
│   │   └── ast-builder/   # AST node builders
│   └── cli/               # CLI adapter layer
│       ├── commands/      # Modular CLI commands
│       ├── __tests__/     # E2E tests with fixtures
│       └── utils.ts       # CLI utilities
├── docs/                  # Architecture and design docs
└── scripts/               # Development tools
```

### Generate SyntaxKind Names

```bash
bun run generate:syntax-kinds
```

This regenerates the human-readable names for TypeScript SyntaxKind enum values from the TypeScript definition file.

### Testing

```bash
# Run all tests
bun test

# Run specific test file
bun test src/core/__tests__/parser.test.ts
```

### Dead Code Analysis

```bash
# Analyze unused files
bun run scripts/analyze-dead-code.ts

# Custom root files
bun run scripts/analyze-dead-code.ts --roots "src/main.ts,src/cli/index.ts"
```

## Recent Updates

### v0.0.3 (Latest)

- ✅ **Major Architecture Refactoring**: Clean separation of core API and CLI layers
- ✅ **Functional Design**: Pure functions with Result type error handling
- ✅ **Modular CLI**: Commands organized into separate modules
- ✅ **Dead Code Cleanup**: Removed unused files and improved code organization
- ✅ **Enhanced Documentation**: Updated architecture and API design docs
- ✅ **YAML Data Structure**: Migrated from TypeScript to YAML for syntax kind data
- ✅ **Syntax Analysis**: Enhanced SyntaxKind analysis with grouping and metadata
- 🚧 **BNF Model System**: In development - syntax rule modeling with BNF

### Previous Versions

- **v0.0.2**: Advanced TypeScript syntax support (95% coverage)
- **v0.0.1**: Basic AST parsing and code generation

## 🛣️ 发展路线图

### 当前阶段: BNF 模型系统开发
按照 [BNF 模型实施规划](docs/bnf-model-implementation-plan.md) 执行：

1. **Phase 1**: 核心 BNF 模型基础设施 (3.5天)
2. **Phase 2**: 命令行工具开发 (2天)  
3. **Phase 3**: TypeScript 语言支持 (4天)
4. **Phase 4**: TypeScript 转换器 (2天)
5. **Phase 5**: 集成与测试 (4天)

详细任务跟踪: [BNF 模型任务清单](docs/bnf-model-tasks.md)

### 未来规划
- 多语言支持 (JavaScript, Python)
- 增量解析优化
- 可视化工具开发
- VS Code 扩展

## 🤝 贡献指南

1. **开发环境**: 使用 Bun 运行时
2. **代码风格**: TypeScript 严格模式
3. **测试要求**: 新功能需包含测试
4. **文档更新**: 重要更改需更新相关文档

## License

MIT
