# 第一阶段 API 设计详细讨论

## 概述

第一阶段重点实现核心 API 层，建立基础架构。本文档详细讨论 API 接口设计的各个方面，为实现提供明确的规范。

## 核心设计问题

### 1. API 风格选择

#### 选项 A: 类实例风格
```typescript
const arbor = new ArborAPI('ast-file.json');
const result = await arbor.query.getRoots();
```

#### 选项 B: 函数式风格
```typescript
const ast = await loadAST('ast-file.json');
const result = await getRoots(ast);
```

#### 选项 C: 混合风格 (推荐)
```typescript
// 便捷函数
const result = await parseFile('main.ts');

// 类实例 - 复杂操作
const arbor = new ArborAPI('ast-file.json');
const nodes = await arbor.query.findNodes(node => node.kindName === 'FunctionDeclaration');
```

**讨论点**: 哪种风格更符合 Node.js 生态习惯？

### 2. 错误处理策略

#### 选项 A: 异常抛出
```typescript
try {
  const result = await parseFile('main.ts');
} catch (error) {
  if (error instanceof ArborError) {
    console.error(error.code, error.message);
  }
}
```

#### 选项 B: Result 模式
```typescript
const result = await parseFile('main.ts');
if (result.error) {
  console.error(result.error.code, result.error.message);
} else {
  console.log(result.data);
}
```

**讨论点**: 考虑到 CLI 的错误处理需求，哪种方式更合适？

### 3. 数据加载策略

#### 问题: AST 数据的加载时机
- **延迟加载**: 创建 API 实例时不加载，使用时才加载
- **预加载**: 创建时就加载所有数据
- **按需加载**: 根据查询需求部分加载

```typescript
// 延迟加载
const api = new QueryAPI('large-file.ast.json'); // 快速创建
const roots = await api.getRoots(); // 此时才加载文件

// 预加载
const api = await QueryAPI.load('large-file.ast.json'); // 创建时加载
const roots = await api.getRoots(); // 直接查询内存数据
```

**讨论点**: 大型 AST 文件的性能考虑？

## 详细接口设计

### 1. 基础类型定义

```typescript
// src/api/types.ts

/** API 操作结果的通用格式 */
export interface APIResult<T> {
  /** 操作是否成功 */
  success: boolean;
  /** 结果数据 */
  data?: T;
  /** 错误信息 */
  error?: APIError;
  /** 操作元信息 */
  meta: {
    /** 操作类型 */
    operation: string;
    /** 执行时间 (毫秒) */
    duration: number;
    /** 时间戳 */
    timestamp: Date;
    /** API 版本 */
    version: string;
  };
}

/** API 错误类型 */
export interface APIError {
  code: ErrorCode;
  message: string;
  details?: any;
  stack?: string;
}

/** 错误代码枚举 */
export enum ErrorCode {
  // 文件相关
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  
  // 解析相关
  PARSE_ERROR = 'PARSE_ERROR',
  INVALID_TYPESCRIPT = 'INVALID_TYPESCRIPT',
  AST_GENERATION_FAILED = 'AST_GENERATION_FAILED',
  
  // 查询相关
  NODE_NOT_FOUND = 'NODE_NOT_FOUND',
  INVALID_NODE_ID = 'INVALID_NODE_ID',
  INVALID_QUERY = 'INVALID_QUERY',
  
  // 格式相关
  INVALID_FORMAT = 'INVALID_FORMAT',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  
  // 通用
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/** 查询选项基类 */
export interface BaseQueryOptions {
  /** 输出格式 */
  format?: 'object' | 'json' | 'yaml' | 'markdown';
  /** 详细模式 */
  verbose?: boolean;
  /** 超时时间 (毫秒) */
  timeout?: number;
}

/** 节点信息的标准格式 */
export interface NodeInfo {
  /** 节点唯一标识 */
  id: string;
  /** 语法类型编号 */
  kind: number;
  /** 语法类型名称 */
  kindName: string;
  /** 节点文本内容 */
  text?: string;
  /** 起始位置 */
  start?: number;
  /** 结束位置 */
  end?: number;
  /** 节点属性 */
  properties?: Record<string, any>;
  /** 前置注释 */
  leadingComments?: CommentInfo[];
  /** 后置注释 */
  trailingComments?: CommentInfo[];
  /** 子节点ID列表 */
  children?: string[];
  /** 父节点ID (查询时填充) */
  parent?: string;
}
```

### 2. Parser API 详细设计

```typescript
// src/api/parser.ts

export interface ParseOptions extends BaseQueryOptions {
  /** 输出文件路径 */
  outputPath?: string;
  /** 输出格式 */
  outputFormat?: 'json' | 'yaml';
  /** 版本描述 */
  description?: string;
  /** 是否覆盖现有文件 */
  overwrite?: boolean;
  /** 是否启用增量解析 */
  incremental?: boolean;
  /** TypeScript 编译选项 */
  compilerOptions?: ts.CompilerOptions;
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
  totalNodes: number;
  /** 注释数量 */
  commentCount: number;
  /** 源文件大小 (字节) */
  sourceSize: number;
  /** AST 数据大小 (字节) */
  astSize: number;
  /** 解析耗时 (毫秒) */
  parseTime: number;
  /** 内存使用峰值 (字节) */
  memoryPeak?: number;
}

export class ParserAPI {
  /**
   * 解析 TypeScript 文件
   * @param sourceFile - 源文件路径
   * @param options - 解析选项
   */
  async parseFile(sourceFile: string, options?: ParseOptions): Promise<APIResult<ParseResult>>;
  
  /**
   * 解析 TypeScript 代码字符串
   * @param sourceCode - 源代码
   * @param fileName - 文件名 (用于错误提示)
   * @param options - 解析选项
   */
  async parseCode(sourceCode: string, fileName?: string, options?: ParseOptions): Promise<APIResult<ParseResult>>;
  
  /**
   * 增量解析 - 向现有 AST 添加新版本
   * @param astFile - 现有 AST 文件路径
   * @param sourceFile - 新的源文件路径
   * @param options - 解析选项
   */
  async parseIncremental(astFile: string, sourceFile: string, options?: ParseOptions): Promise<APIResult<ParseResult>>;
  
  /**
   * 批量解析多个文件
   * @param sourceFiles - 源文件路径数组
   * @param options - 解析选项
   */
  async parseMultiple(sourceFiles: string[], options?: ParseOptions): Promise<APIResult<ParseResult[]>>;
  
  /**
   * 验证 AST 文件格式
   * @param astFile - AST 文件路径
   */
  async validateAST(astFile: string): Promise<APIResult<{ valid: boolean; errors?: string[] }>>;
}
```

### 3. Query API 详细设计

```typescript
// src/api/query.ts

export interface QueryOptions extends BaseQueryOptions {
  /** 只查询最新版本 */
  latest?: boolean;
  /** 包含注释信息 */
  includeComments?: boolean;
  /** 最大查询深度 */
  maxDepth?: number;
  /** 结果排序方式 */
  sortBy?: 'id' | 'kind' | 'position' | 'name';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

export interface TreeOptions extends QueryOptions {
  /** 包含注释 */
  includeComments?: boolean;
  /** 最大展示深度 */
  maxDepth?: number;
  /** 折叠空节点 */
  collapseEmpty?: boolean;
  /** 显示位置信息 */
  showPositions?: boolean;
}

export interface FindOptions extends QueryOptions {
  /** 搜索深度限制 */
  maxDepth?: number;
  /** 最大结果数量 */
  limit?: number;
  /** 跳过数量 */
  skip?: number;
}

export class QueryAPI {
  constructor(private astSource: string | SourceFileAST) {}
  
  /**
   * 获取所有版本的根节点信息
   */
  async getRoots(options?: QueryOptions): Promise<APIResult<NodeInfo[]>>;
  
  /**
   * 获取指定节点的子节点
   * @param nodeId - 节点ID，不传则使用最新根节点
   */
  async getChildren(nodeId?: string, options?: QueryOptions): Promise<APIResult<NodeInfo[]>>;
  
  /**
   * 获取指定节点的父节点
   * @param nodeId - 节点ID
   */
  async getParents(nodeId: string, options?: QueryOptions): Promise<APIResult<NodeInfo[]>>;
  
  /**
   * 获取节点详细信息
   * @param nodeId - 节点ID
   */
  async getNodeInfo(nodeId: string, options?: QueryOptions): Promise<APIResult<NodeInfo>>;
  
  /**
   * 获取树形结构
   * @param rootNodeId - 根节点ID，不传则使用最新根节点
   */
  async getTree(rootNodeId?: string, options?: TreeOptions): Promise<APIResult<TreeNode>>;
  
  /**
   * 按条件查找节点
   * @param predicate - 查找条件函数
   */
  async findNodes(
    predicate: (node: NodeInfo) => boolean,
    options?: FindOptions
  ): Promise<APIResult<NodeInfo[]>>;
  
  /**
   * 按语法类型查找节点
   * @param kindName - 语法类型名称
   */
  async findByKind(kindName: string, options?: FindOptions): Promise<APIResult<NodeInfo[]>>;
  
  /**
   * 按文本内容查找节点
   * @param text - 文本内容 (支持正则表达式)
   */
  async findByText(text: string | RegExp, options?: FindOptions): Promise<APIResult<NodeInfo[]>>;
  
  /**
   * 获取 AST 统计信息
   */
  async getStats(options?: QueryOptions): Promise<APIResult<ASTStats>>;
}

export interface TreeNode extends NodeInfo {
  /** 子节点树 */
  children?: TreeNode[];
  /** 节点深度 */
  depth: number;
  /** 是否为叶子节点 */
  isLeaf: boolean;
}

export interface ASTStats {
  /** 版本数量 */
  versionCount: number;
  /** 总节点数 */
  totalNodes: number;
  /** 节点类型统计 */
  nodeTypeStats: Record<string, number>;
  /** 注释统计 */
  commentStats: {
    total: number;
    singleLine: number;
    multiLine: number;
    jsDoc: number;
  };
  /** 深度统计 */
  depthStats: {
    maxDepth: number;
    averageDepth: number;
  };
}
```

### 4. 统一入口设计

```typescript
// src/api/index.ts

export class ArborAPI {
  private _parser?: ParserAPI;
  private _query?: QueryAPI;
  private _stringifier?: StringifierAPI;
  
  constructor(private astSource?: string | SourceFileAST) {}
  
  /** 解析器 API */
  get parser(): ParserAPI {
    if (!this._parser) {
      this._parser = new ParserAPI();
    }
    return this._parser;
  }
  
  /** 查询 API */
  get query(): QueryAPI {
    if (!this._query) {
      if (!this.astSource) {
        throw new Error('AST source required for query operations');
      }
      this._query = new QueryAPI(this.astSource);
    }
    return this._query;
  }
  
  /** 代码生成 API */
  get stringifier(): StringifierAPI {
    if (!this._stringifier) {
      if (!this.astSource) {
        throw new Error('AST source required for stringifier operations');
      }
      this._stringifier = new StringifierAPI(this.astSource);
    }
    return this._stringifier;
  }
  
  /**
   * 加载 AST 数据
   * @param source - AST 文件路径或数据对象
   */
  async loadAST(source: string | SourceFileAST): Promise<APIResult<void>> {
    this.astSource = source;
    // 清除缓存的实例
    this._query = undefined;
    this._stringifier = undefined;
    
    // 如果是文件路径，验证文件是否存在
    if (typeof source === 'string') {
      // 验证逻辑...
    }
    
    return {
      success: true,
      meta: {
        operation: 'loadAST',
        duration: 0,
        timestamp: new Date(),
        version: '1.0.0'
      }
    };
  }
  
  /**
   * 保存 AST 到文件
   */
  async saveAST(filePath: string, format?: 'json' | 'yaml'): Promise<APIResult<void>> {
    // 实现保存逻辑...
  }
}

// 便捷函数导出
export async function parseFile(sourceFile: string, options?: ParseOptions): Promise<APIResult<ParseResult>> {
  const parser = new ParserAPI();
  return await parser.parseFile(sourceFile, options);
}

export async function queryAST(astFile: string): Promise<QueryAPI> {
  return new QueryAPI(astFile);
}
```

## 核心问题讨论

### 1. API 返回格式统一性

**问题**: 是否所有 API 都返回 `APIResult<T>` 格式？

**考虑因素**:
- ✅ 统一的错误处理和元信息
- ✅ 便于中间件和拦截器实现
- ❌ 增加了简单操作的复杂度
- ❌ 与现有 Node.js 生态不完全一致

**建议**: 提供两套接口
```typescript
// 完整格式 - 适合复杂场景
async getRoots(options?: QueryOptions): Promise<APIResult<NodeInfo[]>>;

// 简化格式 - 适合简单场景
async getRootsSimple(options?: QueryOptions): Promise<NodeInfo[]>;
```

### 2. 异步 vs 同步

**问题**: 哪些操作应该是异步的？

**当前设计**: 所有 I/O 操作异步，纯计算操作可以同步
```typescript
// 异步 - 涉及文件 I/O
async parseFile(sourceFile: string): Promise<APIResult<ParseResult>>;
async loadAST(filePath: string): Promise<APIResult<void>>;

// 同步 - 纯内存操作
getNodeInfo(nodeId: string): APIResult<NodeInfo>;
findNodes(predicate: (node: NodeInfo) => boolean): APIResult<NodeInfo[]>;
```

### 3. 缓存和性能

**问题**: 如何处理大型 AST 的内存管理？

**选项**:
- **全内存加载**: 快速查询，高内存占用
- **流式处理**: 低内存占用，查询较慢
- **分页加载**: 平衡方案，复杂度较高

**建议**: 
```typescript
export interface CacheOptions {
  /** 缓存策略 */
  strategy: 'memory' | 'disk' | 'hybrid';
  /** 最大内存使用 (MB) */
  maxMemory?: number;
  /** 缓存过期时间 (毫秒) */
  ttl?: number;
}
```

## 下一步讨论

1. **API 风格选择**: 您偏好哪种 API 风格？
2. **错误处理**: 异常抛出 vs Result 模式，您的倾向？
3. **性能权衡**: 对于大文件处理，您更关注速度还是内存占用？
4. **接口粒度**: 当前的接口划分是否合适？需要调整吗？

请给出您的意见，我们可以根据讨论结果细化 API 设计，然后开始实现原型。
