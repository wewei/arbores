# 项目结构设计 - 基于API设计v5

## 设计原则

基于API设计v5的核心原则：

### 函数式无状态设计
- API层采用纯函数设计，状态通过参数传递
- 数据存储和缓存由调用层(CLI/HTTP)负责
- API专注于业务逻辑，不处理I/O操作

### 统一错误处理  
- 使用Result<T>类型包装所有返回值
- 避免throw异常，错误通过返回值传递
- 类型安全的错误处理机制

### 适配器模式分层
- API层: 纯函数式业务逻辑
- CLI层: 文件I/O + 格式转换 + API调用
- HTTP层: 网络I/O + JSON处理 + API调用

## 目标架构

```
arbores/
├── src/
│   ├── api/                    # Node.js API层 - 纯函数式接口
│   │   ├── types.ts           # Result<T>类型、错误类型、数据类型
│   │   ├── parser.ts          # parseCode() 函数
│   │   ├── query.ts           # getRoots(), getNode(), getChildren(), getParents() 函数
│   │   ├── stringify.ts       # stringifyNode(), stringifyAST() 函数
│   │   └── index.ts           # API统一导出
│   ├── core/                   # 核心业务逻辑（重构现有代码）
│   │   ├── parser.ts          # AST解析核心逻辑
│   │   ├── stringifier.ts     # 代码生成核心逻辑  
│   │   ├── query-core.ts      # 查询逻辑核心（从CLI提取）
│   │   └── ast-builder/       # AST构建器（现有）
│   ├── types.ts               # 基础类型定义（现有）
│   ├── utils.ts               # 工具函数（现有）
│   └── syntax-kind-names.ts   # 语法类型名称（现有）
├── cli/                       # CLI适配器层
│   ├── index.ts               # CLI入口（现有，保持不变）
│   ├── parse.ts               # 解析命令适配器
│   ├── query.ts               # 查询命令适配器
│   ├── stringify.ts           # 代码生成命令适配器  
│   └── utils/                 # CLI工具函数
│       ├── file-io.ts         # 文件I/O操作
│       ├── format.ts          # 输出格式处理(JSON/YAML/表格)
│       └── error.ts           # CLI错误处理
├── tests/                     # 测试文件
│   ├── fixtures/              # 共享测试数据
│   │   ├── ast-samples/
│   │   ├── ts-samples/
│   │   └── expected/
│   └── utils/                 # 测试工具
│       ├── helpers.ts
│       └── mock.ts
├── http/                      # HTTP API层（未来扩展）
│   ├── server.ts             # HTTP服务器
│   ├── routes/               # 路由处理
│   └── middleware/           # 中间件
├── docs/                      # 文档
├── samples/                   # 示例文件
└── scripts/                   # 构建脚本
```

## 重构计划

### Phase 1: API层基础设施

#### 1.1 核心类型定义
**创建 `src/core/types.ts`**
```typescript
// 错误处理类型
export type ErrorCode = 'PARSE_ERROR' | 'NODE_NOT_FOUND' | 'INVALID_JSON' | 'INVALID_AST_STRUCTURE';

export class ArborError extends Error {
  constructor(public code: ErrorCode, public message: string) {
    super(message);
  }
}

// Result模式
export type Result<T> = 
  | { success: true; data: T; }
  | { success: false; error: ArborError; };

// 数据类型 - 与现有types.ts对齐
export type NodeInfo = {
  id: string;
  kind: number;
  text?: string;
  properties?: Record<string, any>;
  children?: string[];
  leadingComments?: CommentInfo[];
  trailingComments?: CommentInfo[];
};

export type VersionInfo = {
  created_at: string;
  root_node_id: string;
  description?: string;
};

export type ParseResult = {
  ast: SourceFileAST;
  rootNodeId: string;
  stats: ParseStats;
};
```

#### 1.2 Parser API实现
**创建 `src/core/parser.ts`**
```typescript
import { Result, ParseResult, ArborError } from './types';
import { parseTypeScriptCode } from '../core/parser'; // 重构现有parser

export function parseCode(
  sourceCode: string, 
  baseAST: SourceFileAST
): Result<ParseResult> {
  try {
    const result = parseTypeScriptCode(sourceCode, baseAST);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: new ArborError('PARSE_ERROR', error.message) 
    };
  }
}
```

### Phase 2: 查询和代码生成API

#### 2.1 Query API实现
**创建 `src/core/query.ts`**
```typescript
export function getRoots(ast: SourceFileAST): Result<VersionInfo[]> {
  // 从现有CLI代码中提取逻辑
}

export function getNode(ast: SourceFileAST, nodeId: string): Result<NodeInfo> {
  // 实现节点查询逻辑
}

export function getChildren(ast: SourceFileAST, nodeId: string): Result<NodeInfo[]> {
  // 实现子节点查询逻辑
}

export function getParents(ast: SourceFileAST, nodeId: string): Result<NodeInfo[]> {
  // 实现父节点链查询逻辑
}
```

#### 2.2 Stringify API实现  
**创建 `src/core/stringify.ts`**
```typescript
export function stringifyNode(
  ast: SourceFileAST,
  nodeId: string, 
  options?: StringifyOptions
): Result<string> {
  // 集成现有stringifier逻辑
}

export function stringifyAST(
  ast: SourceFileAST,
  version?: string,
  options?: StringifyOptions  
): Result<string> {
  // 实现完整AST代码生成
}
```

### Phase 3: CLI适配器重构

#### 3.1 CLI命令适配器化
**重构 `cli/parse.ts`**
```typescript
import { parseCode } from '../src/core/parser';
import { loadAST, saveAST } from './utils/file-io';
import { formatOutput } from './utils/format';
import { handleCLIError } from './utils/error';

export async function parseCommand(sourceFile: string, options: ParseOptions) {
  // 文件读取
  const sourceCode = await fs.readFile(sourceFile, 'utf-8');
  const baseAST = options.astFile ? await loadAST(options.astFile) : createEmptyAST();
  
  // API调用
  const result = parseCode(sourceCode, baseAST);
  if (!result.success) {
    handleCLIError(result.error);
    return;
  }
  
  // 文件保存和输出
  if (options.astFile) {
    await saveAST(options.astFile, result.data.ast);
  }
  formatOutput(result.data, options);
}
```

#### 3.2 CLI工具函数
**创建 `cli/utils/file-io.ts`**
```typescript
export async function loadAST(filePath: string): Promise<SourceFileAST> {
  // JSON/YAML文件加载逻辑
}

export async function saveAST(filePath: string, ast: SourceFileAST): Promise<void> {
  // JSON/YAML文件保存逻辑，支持格式自动检测
}
```

**创建 `cli/utils/format.ts`**
```typescript
export function formatOutput(data: any, options: OutputOptions): void {
  // 输出格式处理：表格、JSON、YAML等
}
```

### Phase 4: 核心逻辑重构

#### 4.1 现有代码适配
- 重构 `src/parser.ts` 为 `src/core/parser.ts`，提取纯逻辑部分
- 重构 `src/stringifier.ts` 为 `src/core/stringifier.ts`
- 从CLI代码中提取查询逻辑到 `src/core/query-core.ts`

#### 4.2 保持兼容性
- 保留现有的类型定义结构
- 保持AST文件格式不变
- 确保CLI接口完全兼容
## 测试策略

### 单元测试结构
```
src/core/__tests__/
├── types.test.ts           # Result<T>类型和错误处理测试
├── parser.test.ts          # Parser API纯函数测试
├── query.test.ts           # Query API纯函数测试  
└── stringify.test.ts       # Stringify API纯函数测试

cli/__tests__/
├── parse.test.ts           # CLI解析命令端到端测试
├── query.test.ts           # CLI查询命令端到端测试  
└── stringify.test.ts       # CLI代码生成命令端到端测试
```

**测试组织原则**:
- 测试文件与被测文件同目录下的`__tests__`文件夹
- 便于IDE代码导航和关联检索
- 单元测试覆盖API层纯函数
- 集成测试覆盖CLI端到端流程

## 迁移策略

### 渐进式无破坏迁移

#### Stage 1: 建设新API层
- 创建API层，与现有代码并行存在
- 现有CLI继续正常工作
- 逐步测试和完善新API

#### Stage 2: CLI内部切换  
- CLI命令内部切换到使用新API
- 保持CLI接口完全不变
- 通过测试确保功能等价

#### Stage 3: 清理旧代码
- 移除CLI中直接调用核心逻辑的代码
- 清理不再使用的工具函数
- 优化代码结构

### 兼容性保证

#### CLI接口兼容
- 命令行参数格式完全不变
- 输出格式保持一致
- 错误消息保持可读性
- 性能不降级

#### 数据格式兼容
- AST JSON/YAML文件格式不变
- 现有AST文件继续可用
- 版本信息结构保持兼容

#### API版本策略
- 新API采用语义化版本控制
- 向后兼容的变更为minor版本
- 破坏性变更为major版本

## 开发流程

### API优先设计流程

1. **接口设计阶段**
   - 基于用例定义API函数签名
   - 确定Result<T>类型的错误码
   - 评审接口设计的合理性

2. **类型定义阶段**  
   - 实现完整的TypeScript类型定义
   - 确保类型安全和编译时检查
   - 生成API文档框架

3. **实现和测试阶段**
   - TDD方式实现API函数
   - 单元测试覆盖所有分支
   - 集成测试验证端到端流程

### 质量保证流程

#### 代码质量
- TypeScript strict mode全面启用
- ESLint和Prettier代码规范检查
- 单元测试覆盖率>95%要求

#### 性能质量
- 解析性能基准测试
- 内存使用情况监控  
- 大文件处理能力验证

#### 用户体验质量
- CLI命令响应时间测试
- 错误消息清晰度评估
- 文档完整性检查

## 预期收益

### 架构收益

#### 清晰的职责分离
- API层: 纯业务逻辑，易于测试
- CLI层: I/O和用户交互，易于扩展
- 核心层: 算法实现，专注性能

#### 函数式设计优势
- 无副作用，易于推理和调试
- 便于并行处理和缓存优化
- 易于mock测试和单元测试

#### 类型安全保障
- 编译时错误检查
- IDE智能提示和重构支持
- 运行时错误减少

### 扩展能力收益

#### HTTP API就绪
- API层可直接用于HTTP服务
- 无需额外的业务逻辑开发
- 支持微服务架构扩展

#### 多客户端支持
- Node.js程序可直接调用API
- 浏览器环境可能的支持
- 第三方工具集成友好

#### 新功能扩展
- 新增API函数成本低
- 支持插件化架构设计
- 易于添加新的输出格式

---

*基于API设计v5的项目结构设计*  
*更新时间：2025年7月20日*  
*版本：v2.0*  
*状态：设计阶段*
