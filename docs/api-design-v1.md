# Arbores Node.js API 设计提案

## 概述

基于当前 CLI 功能，设计统一的 Node.js API 接口，支持程序化调用所有核心功能。API 设计原则：类型安全、模块化、易用性、一致性。

## 核心 API 模块

### 1. Parser API - 解析模块

负责将 TypeScript 代码解析为 AST 格式。

```typescript
// src/api/parser.ts
export interface ParseOptions {
  /** 输出格式 */
  format?: 'json' | 'yaml';
  /** 版本描述 */
  description?: string;
  /** 是否启用增量解析 */
  incremental?: boolean;
  /** 是否覆盖现有文件 */
  overwrite?: boolean;
}

export interface ParseResult {
  /** 生成的 AST 数据 */
  ast: SourceFileAST;
  /** 解析统计信息 */
  stats: {
    nodeCount: number;
    parseTime: number;
    fileSize: number;
  };
}

export class ParserAPI {
  /**
   * 解析 TypeScript 文件到 AST
   * @param sourceFile - TypeScript 源文件路径
   * @param options - 解析选项
   */
  async parseFile(sourceFile: string, options?: ParseOptions): Promise<ParseResult>;
  
  /**
   * 解析 TypeScript 代码字符串到 AST
   * @param sourceCode - TypeScript 源代码
   * @param options - 解析选项
   */
  async parseCode(sourceCode: string, options?: ParseOptions): Promise<ParseResult>;
  
  /**
   * 增量解析：基于现有 AST 文件添加新版本
   * @param astFile - 现有 AST 文件路径
   * @param sourceFile - 新的 TypeScript 源文件
   * @param options - 解析选项
   */
  async parseIncremental(astFile: string, sourceFile: string, options?: ParseOptions): Promise<ParseResult>;
}
```

### 2. Query API - 查询模块

负责 AST 查询和导航功能。

```typescript
// src/api/query.ts
export interface QueryOptions {
  /** 输出格式 */
  format?: 'object' | 'json' | 'yaml' | 'markdown';
  /** 详细模式 */
  verbose?: boolean;
  /** 只返回最新版本 */
  latest?: boolean;
}

export interface NodeInfo {
  id: string;
  kind: number;
  kindName: string;
  text?: string;
  properties?: Record<string, any>;
  leadingComments?: CommentInfo[];
  trailingComments?: CommentInfo[];
}

export interface QueryResult<T = any> {
  /** 查询结果数据 */
  data: T;
  /** 查询元信息 */
  meta: {
    queryType: string;
    nodeId?: string;
    version?: string;
    timestamp: Date;
  };
}

export class QueryAPI {
  constructor(private ast: SourceFileAST | string) {}
  
  /**
   * 获取根节点信息
   * @param options - 查询选项
   */
  async getRoots(options?: QueryOptions): Promise<QueryResult<NodeInfo[]>>;
  
  /**
   * 获取节点的子节点
   * @param nodeId - 节点ID，不传则使用最新根节点
   * @param options - 查询选项
   */
  async getChildren(nodeId?: string, options?: QueryOptions): Promise<QueryResult<NodeInfo[]>>;
  
  /**
   * 获取节点的父节点
   * @param nodeId - 节点ID
   * @param options - 查询选项
   */
  async getParents(nodeId: string, options?: QueryOptions): Promise<QueryResult<NodeInfo[]>>;
  
  /**
   * 获取节点详细信息
   * @param nodeId - 节点ID
   * @param options - 查询选项
   */
  async getNodeInfo(nodeId: string, options?: QueryOptions): Promise<QueryResult<NodeInfo>>;
  
  /**
   * 获取树形结构
   * @param rootNodeId - 根节点ID，不传则使用最新根节点
   * @param options - 查询选项
   */
  async getTree(rootNodeId?: string, options?: QueryOptions & { 
    includeComments?: boolean;
    maxDepth?: number;
  }): Promise<QueryResult<TreeNode>>;
  
  /**
   * 查找节点（按条件）
   * @param predicate - 查找条件
   * @param options - 查询选项
   */
  async findNodes(
    predicate: (node: NodeInfo) => boolean,
    options?: QueryOptions
  ): Promise<QueryResult<NodeInfo[]>>;
}

export interface TreeNode extends NodeInfo {
  children?: TreeNode[];
  comments?: CommentInfo[];
}
```

### 3. Stringifier API - 代码生成模块

负责将 AST 转换回 TypeScript 代码。

```typescript
// src/api/stringifier.ts
export interface StringifyOptions {
  /** 格式化风格 */
  format?: 'compact' | 'readable' | 'minified';
  /** 缩进设置 */
  indent?: {
    type: 'spaces' | 'tabs';
    size: number;
  };
  /** 是否保留注释 */
  preserveComments?: boolean;
}

export interface StringifyResult {
  /** 生成的代码 */
  code: string;
  /** 生成统计信息 */
  stats: {
    linesOfCode: number;
    codeSize: number;
    generationTime: number;
  };
}

export class StringifierAPI {
  constructor(private ast: SourceFileAST | string) {}
  
  /**
   * 将指定节点转换为 TypeScript 代码
   * @param nodeId - 节点ID，不传则使用最新根节点
   * @param options - 代码生成选项
   */
  async stringify(nodeId?: string, options?: StringifyOptions): Promise<StringifyResult>;
  
  /**
   * 将多个节点转换为代码片段
   * @param nodeIds - 节点ID数组
   * @param options - 代码生成选项
   */
  async stringifyMultiple(nodeIds: string[], options?: StringifyOptions): Promise<StringifyResult>;
  
  /**
   * 重构代码：替换指定节点
   * @param nodeId - 要替换的节点ID
   * @param newCode - 新的代码片段
   * @param options - 代码生成选项
   */
  async refactor(nodeId: string, newCode: string, options?: StringifyOptions): Promise<StringifyResult>;
}
```

### 4. Format API - 格式化模块

负责统一的输出格式处理。

```typescript
// src/api/format.ts
export type OutputFormat = 'object' | 'json' | 'yaml' | 'markdown';

export interface FormatOptions {
  format: OutputFormat;
  pretty?: boolean;
  markdownTable?: boolean;
}

export class FormatAPI {
  /**
   * 格式化数据到指定格式
   * @param data - 要格式化的数据
   * @param options - 格式选项
   */
  static format<T>(data: T, options: FormatOptions): string | T;
  
  /**
   * 创建 Markdown 表格
   * @param headers - 表头
   * @param rows - 数据行
   */
  static createMarkdownTable(headers: string[], rows: string[][]): string;
  
  /**
   * 检测数据格式
   * @param input - 输入数据
   */
  static detectFormat(input: string): OutputFormat;
}
```

## 统一入口 API

提供便捷的统一接口，封装所有功能模块。

```typescript
// src/api/index.ts
export class ArborAPI {
  /**
   * 创建 API 实例
   * @param astSource - AST 数据源（文件路径或 AST 对象）
   */
  constructor(private astSource?: string | SourceFileAST) {}
  
  /** 解析器 API */
  get parser(): ParserAPI;
  
  /** 查询 API */
  get query(): QueryAPI;
  
  /** 代码生成 API */
  get stringifier(): StringifierAPI;
  
  /** 格式化 API */
  get format(): FormatAPI;
  
  /**
   * 加载 AST 文件
   * @param filePath - AST 文件路径
   */
  async loadAST(filePath: string): Promise<void>;
  
  /**
   * 保存 AST 到文件
   * @param filePath - 输出文件路径
   * @param format - 输出格式
   */
  async saveAST(filePath: string, format?: 'json' | 'yaml'): Promise<void>;
}

// 便捷函数导出
export async function parseFile(sourceFile: string, options?: ParseOptions): Promise<ParseResult>;
export async function queryAST(astFile: string): Promise<QueryAPI>;
export async function stringifyNode(astFile: string, nodeId: string, options?: StringifyOptions): Promise<StringifyResult>;
```

## 使用示例

### 基本用法

```typescript
import { ArborAPI, parseFile, queryAST } from 'arbores';

// 方式 1: 使用统一 API
const arbor = new ArborAPI();
const parseResult = await arbor.parser.parseFile('src/main.ts');
const children = await arbor.query.getChildren(parseResult.ast.versions[0].root_node_id);

// 方式 2: 使用便捷函数
const result = await parseFile('src/main.ts', { format: 'json' });
const queryAPI = await queryAST('output.ast.json');
const roots = await queryAPI.getRoots({ format: 'object' });
```

### 高级用法

```typescript
// 复合查询
const arbor = new ArborAPI('output.ast.json');
const functionNodes = await arbor.query.findNodes(
  node => node.kindName === 'FunctionDeclaration',
  { format: 'object' }
);

// 代码重构
for (const func of functionNodes.data) {
  const newCode = `// Refactored function\n${await arbor.stringifier.stringify(func.id)}`;
  await arbor.stringifier.refactor(func.id, newCode);
}
```

## 错误处理

```typescript
export class ArborError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ArborError';
  }
}

export const ErrorCodes = {
  PARSE_ERROR: 'PARSE_ERROR',
  NODE_NOT_FOUND: 'NODE_NOT_FOUND',
  INVALID_FORMAT: 'INVALID_FORMAT',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  INVALID_AST: 'INVALID_AST'
} as const;
```

## 讨论点

### 1. API 设计原则
- **一致性**：所有模块使用相似的方法签名和返回格式
- **类型安全**：完整的 TypeScript 类型定义
- **可扩展**：支持插件和自定义格式化器
- **性能**：支持流式处理和缓存

### 2. 数据流设计
- **输入**：文件路径 | 代码字符串 | AST 对象
- **处理**：统一的选项接口和错误处理
- **输出**：类型化的结果对象，支持多种格式

### 3. 向后兼容
- CLI 保持现有接口不变
- 新 API 作为底层实现
- 提供迁移工具和文档

### 4. 测试策略
- 每个 API 模块独立测试
- Mock 文件系统操作
- 集成测试覆盖真实使用场景

请对此设计提案提出意见和建议，我们可以根据讨论结果调整设计方案。
