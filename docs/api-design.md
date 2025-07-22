# API 设计

基于讨论和现有代码结构，本文档定义了arbores项目的Node.js API层设计。

## 设计原则 ✅

### 1. **函数式无状态设计** ✅

- 所有API为纯函数，状态通过参数传递
- 便于适配CLI和HTTP服务
- 可预测的行为，易于测试和调试

### 2. **统一错误处理** ✅

- 使用`Result<T>`类型包装所有返回值
- 避免throw，错误通过返回值传递
- 类型安全的错误处理

### 3. **数据存储外置** ✅

- API层不处理数据存储和缓存
- 状态管理由CLI/HTTP层负责
- API专注于业务逻辑

### 4. **单一职责原则** ✅

- 每个函数职责明确
- 对应现有CLI命令功能
- 不提供复合操作

### 5. **统一数据格式** ✅

- API统一返回JSON数据结构
- 格式转换由调用层处理
- 接口简洁一致

## 核心类型定义 ✅

```typescript
// src/core/types.ts - 已实现

/** 错误代码枚举 - 只包含AST/数据层错误 */
export type ErrorCode = 
  | 'PARSE_ERROR'
  | 'NODE_NOT_FOUND'
  | 'INVALID_JSON'
  | 'INVALID_AST_STRUCTURE';

/** 错误类型 - 简化版，统一用message表达 */
export class ArborError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string
  ) {
    super(message);
  }
}

/** 统一的结果类型 */
export type Result<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ArborError;
};

/** 注释信息类型 - 与现有types.ts对齐 */
export type CommentInfo = {
  kind: 'SingleLineCommentTrivia' | 'MultiLineCommentTrivia';
  text: string;
};

/** 节点信息格式 - 与现有ASTNode对齐，去掉start/end/kindName */
export type NodeInfo = {
  id: string;
  kind: number;
  text?: string;
  properties?: Record<string, any>;
  children?: string[];
  leadingComments?: CommentInfo[];
  trailingComments?: CommentInfo[];
};

/** 版本信息格式 - 与现有FileVersion对齐 */
export type VersionInfo = {
  created_at: string;
  root_node_id: string;
  description?: string;
};

/** 文件信息格式 */
export type FileInfo = {
  fileName: string;
  versions: VersionInfo[];
};



/** 解析统计信息 */
export type ParseStats = {
  nodeCount: number;
  commentCount: number;
  parseTime: number;
  sourceSize: number;
};

/** 解析结果 */
export type ParseResult = {
  ast: SourceFileAST;
  rootNodeId: string;
  stats: ParseStats;
};
```

## Parser API - 解析模块 ✅

```typescript
// src/core/parser.ts - 已实现

/**
 * 解析TypeScript代码到AST
 * @param sourceCode - TypeScript源代码
 * @param baseAST - 基础AST数据，新节点将添加到此AST中
 * @returns 解析结果
 */
export function parseCode(
  sourceCode: string, 
  baseAST: SourceFileAST
): Result<ParseResult>; // ✅ 已实现
```

## Query API - 查询模块 🚧

```typescript
// src/core/query.ts - 部分实现

/**
 * 获取AST中所有版本的根节点信息
 * @param ast - AST数据
 * @returns 根节点信息数组
 */
export function getRoots(ast: SourceFileAST): Result<VersionInfo[]>;

/**
 * 获取指定节点的详细信息
 * @param ast - AST数据
 * @param nodeId - 节点ID
 * @returns 节点详细信息
 */
export function getNode(
  ast: SourceFileAST,
  nodeId: string
): Result<NodeInfo>;

/**
 * 获取指定节点的所有子节点
 * @param ast - AST数据
 * @param nodeId - 父节点ID
 * @returns 子节点信息数组
 */
export function getChildren(
  ast: SourceFileAST,
  nodeId: string
): Result<NodeInfo[]>;

/**
 * 获取指定节点的父节点链
 * @param ast - AST数据
 * @param nodeId - 子节点ID
 * @returns 父节点信息数组(从直接父节点到根节点)
 */
export function getParents(
  ast: SourceFileAST,
  nodeId: string
): Result<NodeInfo[]>;
```

## Stringify API - 代码生成模块

```typescript
// src/core/stringify.ts

/** 字符串化选项 - 与现有StringifyOptions对齐 */
export type StringifyOptions = {
  format?: 'compact' | 'readable' | 'minified';
};

/**
 * 将AST节点转换为TypeScript代码
 * @param ast - AST数据
 * @param nodeId - 要生成代码的节点ID
 * @param options - 字符串化选项
 * @returns 生成的TypeScript代码
 */
export function stringifyNode(
  ast: SourceFileAST,
  nodeId: string,
  options?: StringifyOptions
): Result<string>;

/**
 * 将整个AST转换为TypeScript代码
 * @param ast - AST数据
 * @param version - 指定版本，可选
 * @param options - 字符串化选项
 * @returns 生成的TypeScript代码
 */
export function stringifyAST(
  ast: SourceFileAST,
  version?: string,
  options?: StringifyOptions
): Result<string>;
```

## 实现计划

### Phase 1: 核心类型和错误处理

- [ ] 实现 `src/core/types.ts`
- [ ] 实现统一的错误处理机制
- [ ] 编写类型定义的单元测试

### Phase 2: Parser API

- [ ] 实现 `src/core/parser.ts` 的核心函数
- [ ] 集成现有的 `src/parser.ts` 逻辑
- [ ] 编写解析功能的单元测试

### Phase 3: Query API

- [ ] 实现 `src/core/query.ts` 的所有查询函数
- [ ] 重构现有CLI查询逻辑使用新API
- [ ] 编写查询功能的单元测试

### Phase 4: Stringify API

- [ ] 实现 `src/core/stringify.ts` 的代码生成函数
- [ ] 集成现有的stringifier逻辑
- [ ] 编写代码生成的单元测试

### Phase 5: CLI适配层

- [ ] 重构CLI使用新的API层
- [ ] 实现格式转换逻辑(markdown, json, yaml)
- [ ] 保持CLI接口的兼容性

### Phase 6: 测试和文档

- [ ] 完成所有模块的单元测试覆盖
- [ ] 编写集成测试
- [ ] 更新API文档和使用示例

## 测试策略

### 单元测试 (bun:test)

- 每个API函数都有对应的测试用例
- 测试正常流程和错误情况
- 测试文件结构：`tests/api/*.test.ts`

### 集成测试

- 测试API层与现有代码的集成
- 测试CLI命令使用新API的正确性
- 测试文件结构：`tests/integration/*.test.ts`

### 测试数据

- 使用真实的TypeScript代码作为测试样本
- 准备各种边缘情况的AST数据
- 测试数据目录：`tests/fixtures/`

## 迁移策略

### 渐进式迁移

1. 保持现有CLI接口不变
2. 内部逐步使用新API替换直接实现
3. 确保每个迁移步骤都有测试覆盖
4. 最后移除旧的直接实现代码

### 兼容性保证

- CLI命令行接口保持完全兼容
- 输出格式保持一致
- 错误消息保持可读性

这个设计提供了清晰的API边界，便于测试、维护和扩展，同时保持了与现有代码的兼容性。
