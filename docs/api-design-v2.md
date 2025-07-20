# API 设计关键决策点 - 修订版

## 目标

基于讨论，明确第一阶段 Node.js API 的最终设计决策。

## ✅ 核心设计决策 (已确认)

### 1. **函数式无状态设计**

**决策**: 采用纯函数设计，所有状态通过参数传递

**优势**:
- 便于适配 CLI 和 HTTP 服务
- 可预测的行为，易于测试
- 支持并行和分布式处理

**示例**:
```typescript
// ✅ 采用这种设计
export function getRoots(ast: SourceFileAST, latest?: boolean): ArborResult<VersionInfo[]>;

// ❌ 不采用类实例状态管理
class QueryAPI {
  constructor(private ast: SourceFileAST) {}
  getRoots(): VersionInfo[];
}
```

### 2. **ArborResult 错误处理**

**决策**: 错误通过返回值传递，避免 throw 和 Promise reject

**原因**:
- 类型安全的错误处理
- 避免 Promise reject 的类型不确定性
- 统一的错误处理模式

**设计**:
```typescript
export type ArborResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ArborError };

// 同步操作
export function getNodeInfo(ast: SourceFileAST, nodeId: string): ArborResult<NodeInfo>;

// 异步操作  
export async function parseFile(filePath: string): Promise<ArborResult<ParseResult>>;
```

### 3. **数据存储外置**

**决策**: API 层不处理数据存储和缓存，由调用层负责

**分工明确**:
- **API 层**: 纯业务逻辑，无状态
- **CLI 层**: 文件 I/O，状态管理
- **HTTP 层**: 请求缓存，数据管理

### 4. **单一职责原则**

**决策**: 每个 API 函数对应一个具体的 CLI 命令功能

**API 列表**:
- `parseFile()` → `arbores parse`
- `getRoots()` → `arbores roots`  
- `getChildren()` → `arbores children`
- `getParents()` → `arbores parents`
- `getNodeInfo()` → `arbores node`
- `getTree()` → `arbores tree`
- `stringifyNode()` → `arbores stringify`

### 5. **统一数据格式**

**决策**: API 统一返回 JSON 数据结构，格式转换由调用层处理

**分工**:
- **API 层**: 返回标准 JSON 数据
- **CLI 层**: 转换为 markdown/yaml 等格式
- **HTTP 层**: 根据 Accept 头转换响应

## 核心决策点

### 1. API 风格选择 🎯

**问题**: 采用哪种 API 设计风格？

**选项对比**:

| 风格 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 函数式 | 简单直接，无状态 | 重复传参，难以扩展 | 简单操作 |
| 类实例 | 状态管理，方法链式 | 创建开销，内存管理 | 复杂操作 |
| 混合式 | 兼顾两者优点 | 学习成本，API 复杂 | 全场景 |

**我的建议**: **混合风格**
- 便捷函数用于简单操作
- 类实例用于复杂操作和状态管理
- 符合 Node.js 生态习惯

### 2. 错误处理策略 🚨

**问题**: 如何处理 API 调用中的错误？

**方案对比**:

```typescript
// 方案 A: 异常抛出 (传统 Node.js)
try {
  const result = await parseFile('main.ts');
  console.log(result.ast);
} catch (error) {
  console.error(error.message);
}

// 方案 B: Result 包装 (函数式风格)
const result = await parseFile('main.ts');
if (result.success) {
  console.log(result.data.ast);
} else {
  console.error(result.error.message);
}
```

**我的建议**: **异常抛出**
- 符合 Node.js 和 TypeScript 生态习惯
- CLI 错误处理更自然
- 可以结合类型化错误提供结构化错误信息

### 3. 数据加载策略 💾

**问题**: 何时加载 AST 数据？

**场景分析**:
- **小文件 (< 10MB)**: 预加载，快速响应
- **大文件 (> 100MB)**: 按需加载，节省内存  
- **频繁查询**: 内存缓存
- **偶尔查询**: 磁盘缓存

**我的建议**: **智能加载**
```typescript
class QueryAPI {
  constructor(astSource: string | SourceFileAST, options?: {
    loadStrategy?: 'auto' | 'eager' | 'lazy';
    maxMemoryMB?: number;
  }) {}
}
```

### 4. 接口粒度设计 🔧

**问题**: API 方法的粒度如何确定？

**对比分析**:

```typescript
// 细粒度 - 功能专一
await query.getRootNodes();
await query.getNodeChildren(nodeId);
await query.getNodeParents(nodeId);
await query.getNodeInfo(nodeId);

// 粗粒度 - 一次获取更多
await query.getNodeWithRelations(nodeId, {
  includeParents: true,
  includeChildren: true,
  includeComments: true
});
```

**我的建议**: **细粒度为主，粗粒度补充**
- 细粒度方法提供基础功能
- 粗粒度方法提供常用组合功能
- 保持 API 的简洁性和可预测性

## 确定的 API 设计

基于以上决策，确定以下 API 设计：

### 基础类型

```typescript
// 统一的错误类型
export class ArborError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = 'ArborError';
  }
}

export enum ErrorCode {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PARSE_ERROR = 'PARSE_ERROR',
  NODE_NOT_FOUND = 'NODE_NOT_FOUND',
  INVALID_FORMAT = 'INVALID_FORMAT'
}

// 节点信息标准格式
export interface NodeInfo {
  id: string;
  kind: number;
  kindName: string;
  text?: string;
  properties?: Record<string, any>;
  leadingComments?: CommentInfo[];
  trailingComments?: CommentInfo[];
}
```

### Parser API

```typescript
export interface ParseOptions {
  outputPath?: string;
  outputFormat?: 'json' | 'yaml';
  description?: string;
  overwrite?: boolean;
  compilerOptions?: ts.CompilerOptions;
}

export interface ParseResult {
  ast: SourceFileAST;
  rootNodeId: string;
  stats: {
    nodeCount: number;
    parseTime: number;
    memoryUsage: number;
  };
}

export class ParserAPI {
  async parseFile(sourceFile: string, options?: ParseOptions): Promise<ParseResult>;
  async parseCode(code: string, fileName?: string, options?: ParseOptions): Promise<ParseResult>;
  async parseIncremental(astFile: string, sourceFile: string, options?: ParseOptions): Promise<ParseResult>;
}

// 便捷函数
export async function parseFile(sourceFile: string, options?: ParseOptions): Promise<ParseResult>;
```

### Query API

```typescript
export interface QueryOptions {
  format?: 'object' | 'json' | 'yaml' | 'markdown';
  verbose?: boolean;
  includeComments?: boolean;
}

export class QueryAPI {
  constructor(astSource: string | SourceFileAST, options?: {
    loadStrategy?: 'auto' | 'eager' | 'lazy';
    maxMemoryMB?: number;
  });
  
  // 基础查询方法
  async getRoots(options?: QueryOptions): Promise<NodeInfo[]>;
  async getChildren(nodeId?: string, options?: QueryOptions): Promise<NodeInfo[]>;
  async getParents(nodeId: string, options?: QueryOptions): Promise<NodeInfo[]>;
  async getNodeInfo(nodeId: string, options?: QueryOptions): Promise<NodeInfo>;
  
  // 树形查询
  async getTree(rootNodeId?: string, options?: QueryOptions & {
    maxDepth?: number;
    includeComments?: boolean;
  }): Promise<TreeNode>;
  
  // 搜索方法
  async findNodes(predicate: (node: NodeInfo) => boolean, options?: QueryOptions): Promise<NodeInfo[]>;
  async findByKind(kindName: string, options?: QueryOptions): Promise<NodeInfo[]>;
  async findByText(text: string | RegExp, options?: QueryOptions): Promise<NodeInfo[]>;
}

// 便捷函数
export async function queryAST(astFile: string, options?: any): Promise<QueryAPI>;
```

### 统一入口

```typescript
export class ArborAPI {
  constructor(private astSource?: string | SourceFileAST) {}
  
  get parser(): ParserAPI;
  get query(): QueryAPI;
  get stringifier(): StringifierAPI;
  
  async loadAST(source: string | SourceFileAST): Promise<void>;
  async saveAST(filePath: string, format?: 'json' | 'yaml'): Promise<void>;
}
```

## 实现优先级

### 第一批实现 (核心功能)
1. **ParserAPI.parseFile()** - 基础解析功能
2. **QueryAPI.getRoots()** - 根节点查询
3. **QueryAPI.getChildren()** - 子节点查询
4. **ArborError** - 错误处理

### 第二批实现 (扩展功能)
1. **QueryAPI.getParents()** - 父节点查询
2. **QueryAPI.getNodeInfo()** - 节点详情
3. **QueryAPI.getTree()** - 树形查询

### 第三批实现 (高级功能)
1. **QueryAPI.findNodes()** - 条件搜索
2. **ParserAPI.parseIncremental()** - 增量解析
3. **性能优化和缓存**

## 下一步

1. **确认设计决策**: 您是否同意以上设计决策？
2. **开始原型实现**: 从第一批功能开始实现
3. **编写基础测试**: 为核心 API 编写单元测试
4. **CLI 适配验证**: 确保 API 能满足现有 CLI 需求

请确认这个设计方案，我们就可以开始编写第一个 API 模块的代码了！
