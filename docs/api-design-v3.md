# API 设计修订版 - 函数式无状态设计

## 设计原则确认

基于讨论，确定以下核心设计原则：

### 1. **函数式无状态设计** ✅
- 所有 API 为纯函数，状态通过参数传递
- 便于适配 CLI 和 HTTP 服务
- 可预测的行为，易于测试和调试

### 2. **统一错误处理** ✅
- 使用 `ArborResult<T>` 类型包装所有返回值
- 避免 throw，错误通过返回值传递
- 类型安全的错误处理

### 3. **数据存储外置** ✅
- API 层不处理数据存储和缓存
- 状态管理由 CLI/HTTP 层负责
- API 专注于业务逻辑

### 4. **单一职责原则** ✅
- 每个函数职责明确
- 对应现有 CLI 命令功能
- 不提供复合操作

### 5. **统一数据格式** ✅
- API 统一返回 JSON 数据结构
- 格式转换由调用层处理
- 接口简洁一致

## 核心类型定义

```typescript
// src/api/types.ts

/** 统一的结果类型 */
export type ArborResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ArborError };

/** 错误类型定义 */
export interface ArborError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
}

/** 错误代码枚举 */
export enum ErrorCode {
  // 文件相关
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  
  // 解析相关
  PARSE_ERROR = 'PARSE_ERROR',
  INVALID_TYPESCRIPT = 'INVALID_TYPESCRIPT',
  COMPILER_ERROR = 'COMPILER_ERROR',
  
  // 查询相关
  NODE_NOT_FOUND = 'NODE_NOT_FOUND',
  INVALID_NODE_ID = 'INVALID_NODE_ID',
  AST_STRUCTURE_ERROR = 'AST_STRUCTURE_ERROR',
  
  // 代码生成相关
  STRINGIFY_ERROR = 'STRINGIFY_ERROR',
  INVALID_AST_NODE = 'INVALID_AST_NODE',
  
  // 通用错误
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/** 节点信息标准格式 */
export interface NodeInfo {
  id: string;
  kind: number;
  kindName: string;
  text?: string;
  start?: number;
  end?: number;
  properties?: Record<string, any>;
  leadingComments?: CommentInfo[];
  trailingComments?: CommentInfo[];
}

/** 树节点格式 */
export interface TreeNode extends NodeInfo {
  children: TreeNode[];
  depth: number;
}

/** 版本信息格式 */
export interface VersionInfo {
  version: string;
  rootNodeId: string;
  createdAt: Date;
  description?: string;
}
```

## Parser API - 解析模块

```typescript
// src/api/parser.ts

export interface ParseOptions {
  /** 版本描述 */
  description?: string;
  /** TypeScript 编译选项 */
  compilerOptions?: ts.CompilerOptions;
  /** 是否包含位置信息 */
  includePositions?: boolean;
}

export interface ParseResult {
  /** 生成的 AST 数据 */
  ast: SourceFileAST;
  /** 根节点ID */
  rootNodeId: string;
  /** 解析统计信息 */
  stats: ParseStats;
}

export interface ParseStats {
  /** 节点总数 */
  nodeCount: number;
  /** 注释数量 */
  commentCount: number;
  /** 解析耗时 (毫秒) */
  parseTime: number;
  /** 源文件大小 (字节) */
  sourceSize: number;
}

/**
 * 解析 TypeScript 文件到 AST
 * @param sourceFilePath - TypeScript 源文件路径
 * @param options - 解析选项
 * @returns 解析结果
 */
export async function parseFile(
  sourceFilePath: string, 
  options?: ParseOptions
): Promise<ArborResult<ParseResult>>;

/**
 * 解析 TypeScript 代码字符串到 AST
 * @param sourceCode - TypeScript 源代码
 * @param fileName - 文件名 (用于错误提示)
 * @param options - 解析选项
 * @returns 解析结果
 */
export async function parseCode(
  sourceCode: string, 
  fileName?: string,
  options?: ParseOptions
): Promise<ArborResult<ParseResult>>;

/**
 * 增量解析 - 基于现有 AST 添加新版本
 * @param existingAst - 现有 AST 数据
 * @param sourceFilePath - 新的 TypeScript 源文件路径
 * @param options - 解析选项
 * @returns 更新后的 AST 结果
 */
export async function parseIncremental(
  existingAst: SourceFileAST,
  sourceFilePath: string,
  options?: ParseOptions
): Promise<ArborResult<ParseResult>>;

/**
 * 验证 AST 数据结构的完整性
 * @param ast - AST 数据
 * @returns 验证结果
 */
export function validateAST(ast: SourceFileAST): ArborResult<{
  valid: boolean;
  errors: string[];
}>;
```

## Query API - 查询模块

```typescript
// src/api/query.ts

/**
 * 获取 AST 中所有版本的根节点信息
 * @param ast - AST 数据
 * @param latest - 是否只返回最新版本
 * @returns 根节点信息数组
 */
export function getRoots(
  ast: SourceFileAST, 
  latest?: boolean
): ArborResult<VersionInfo[]>;

/**
 * 获取指定节点的子节点信息
 * @param ast - AST 数据
 * @param nodeId - 父节点ID，不传则使用最新根节点
 * @returns 子节点信息数组
 */
export function getChildren(
  ast: SourceFileAST, 
  nodeId?: string
): ArborResult<NodeInfo[]>;

/**
 * 获取指定节点的父节点信息
 * @param ast - AST 数据
 * @param nodeId - 子节点ID
 * @returns 父节点信息数组
 */
export function getParents(
  ast: SourceFileAST, 
  nodeId: string
): ArborResult<NodeInfo[]>;

/**
 * 获取指定节点的详细信息
 * @param ast - AST 数据
 * @param nodeId - 节点ID
 * @returns 节点详细信息
 */
export function getNodeInfo(
  ast: SourceFileAST, 
  nodeId: string
): ArborResult<NodeInfo>;

/**
 * 获取以指定节点为根的树形结构
 * @param ast - AST 数据
 * @param rootNodeId - 根节点ID，不传则使用最新根节点
 * @param options - 树形选项
 * @returns 树形结构
 */
export function getTree(
  ast: SourceFileAST, 
  rootNodeId?: string,
  options?: {
    maxDepth?: number;
    includeComments?: boolean;
  }
): ArborResult<TreeNode>;

/**
 * 在 AST 中查找满足条件的节点
 * @param ast - AST 数据
 * @param predicate - 查找条件函数
 * @param options - 查找选项
 * @returns 匹配的节点信息数组
 */
export function findNodes(
  ast: SourceFileAST,
  predicate: (node: NodeInfo) => boolean,
  options?: {
    maxResults?: number;
    rootNodeId?: string;
  }
): ArborResult<NodeInfo[]>;

/**
 * 按语法类型查找节点
 * @param ast - AST 数据
 * @param kindName - 语法类型名称
 * @param options - 查找选项
 * @returns 匹配的节点信息数组
 */
export function findByKind(
  ast: SourceFileAST,
  kindName: string,
  options?: {
    maxResults?: number;
    rootNodeId?: string;
  }
): ArborResult<NodeInfo[]>;

/**
 * 按文本内容查找节点
 * @param ast - AST 数据
 * @param textPattern - 文本模式 (字符串或正则)
 * @param options - 查找选项
 * @returns 匹配的节点信息数组
 */
export function findByText(
  ast: SourceFileAST,
  textPattern: string | RegExp,
  options?: {
    maxResults?: number;
    rootNodeId?: string;
  }
): ArborResult<NodeInfo[]>;
```

## Stringifier API - 代码生成模块

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
  /** 生成统计 */
  stats: {
    linesOfCode: number;
    codeSize: number;
    generationTime: number;
  };
}

/**
 * 将指定节点转换为 TypeScript 代码
 * @param ast - AST 数据
 * @param nodeId - 节点ID，不传则使用最新根节点
 * @param options - 代码生成选项
 * @returns 生成的代码结果
 */
export function stringifyNode(
  ast: SourceFileAST,
  nodeId?: string,
  options?: StringifyOptions
): ArborResult<StringifyResult>;

/**
 * 将多个节点转换为代码片段数组
 * @param ast - AST 数据
 * @param nodeIds - 节点ID数组
 * @param options - 代码生成选项
 * @returns 代码片段数组
 */
export function stringifyNodes(
  ast: SourceFileAST,
  nodeIds: string[],
  options?: StringifyOptions
): ArborResult<StringifyResult[]>;
```

## 文件操作 API

```typescript
// src/api/file.ts

/**
 * 从文件加载 AST 数据
 * @param filePath - AST 文件路径
 * @returns AST 数据
 */
export async function loadAST(filePath: string): Promise<ArborResult<SourceFileAST>>;

/**
 * 将 AST 数据保存到文件
 * @param ast - AST 数据
 * @param filePath - 输出文件路径
 * @param format - 输出格式
 * @returns 保存结果
 */
export async function saveAST(
  ast: SourceFileAST,
  filePath: string,
  format?: 'json' | 'yaml'
): Promise<ArborResult<void>>;

/**
 * 检测文件格式
 * @param filePath - 文件路径
 * @returns 文件格式
 */
export function detectFormat(filePath: string): 'json' | 'yaml' | 'unknown';
```

## CLI 适配示例

基于新的 API 设计，CLI 适配将变得非常简洁：

```typescript
// cli/adapters/query.ts

import { loadAST, getRoots, getChildren } from '../src/api';
import { formatOutput } from './format-adapter';

export async function rootsCommand(filePath: string, options: {
  latest?: boolean;
  verbose?: boolean;
  format?: string;
}) {
  // 1. 加载数据
  const astResult = await loadAST(filePath);
  if (!astResult.success) {
    console.error(`Error loading AST: ${astResult.error.message}`);
    process.exit(1);
  }
  
  // 2. 调用 API
  const rootsResult = getRoots(astResult.data, options.latest);
  if (!rootsResult.success) {
    console.error(`Error getting roots: ${rootsResult.error.message}`);
    process.exit(1);
  }
  
  // 3. 格式化输出
  const output = formatOutput(rootsResult.data, {
    format: options.format || 'markdown',
    verbose: options.verbose
  });
  
  console.log(output);
}
```

## 优势总结

### 1. **清晰的架构分层**
- API 层：纯业务逻辑，无状态
- 适配层：处理 I/O、状态管理、格式转换
- 接口层：CLI/HTTP 用户接口

### 2. **类型安全的错误处理**
- `ArborResult<T>` 确保错误类型安全
- 避免 Promise reject 的类型不确定性
- 统一的错误格式和错误码

### 3. **函数式设计优势**
- 可预测的行为
- 易于测试和调试
- 便于并行和分布式处理

### 4. **易于适配多种接口**
- CLI 适配器处理命令行逻辑
- HTTP 适配器处理 Web 请求
- API 层保持纯净和复用

## 实现计划

### 第一阶段：核心 API
1. `src/api/types.ts` - 基础类型定义
2. `src/api/parser.ts` - 解析 API
3. `src/api/query.ts` - 查询 API (基础功能)
4. `src/api/file.ts` - 文件操作 API

### 第二阶段：扩展功能
1. `src/api/stringifier.ts` - 代码生成 API
2. `src/api/query.ts` - 查询 API (高级功能)
3. 完善错误处理和边界情况

### 第三阶段：CLI 适配
1. `cli/adapters/` - 适配器模块
2. `cli/formatters/` - 格式化模块
3. CLI 命令重构

这个设计是否符合您的预期？可以开始实现第一阶段的代码了吗？
