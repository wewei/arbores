# Arbores 代码重构计划

## 概述

本文档描述了 Arbores 项目的重构计划，目标是构建一个清晰的分层架构，支持 CLI、HTTP API 和 Node.js API 多种接口，并提供完善的测试覆盖。

## 当前状况分析

### 现有项目结构
```
arbores/
├── cli/           # CLI 命令实现
│   ├── index.ts   # CLI 主程序和帮助格式化
│   ├── parse.ts   # 解析命令
│   ├── query.ts   # 查询命令 (roots, children, tree)
│   ├── node.ts    # 节点详情命令
│   ├── parents.ts # 父节点查询命令
│   └── stringify.ts # 字符串化命令
├── src/           # 核心逻辑
│   ├── parser.ts  # AST 解析
│   ├── stringifier/ # 代码生成
│   ├── types.ts   # 类型定义
│   └── utils.ts   # 工具函数
├── docs/          # 文档
└── samples/       # 示例文件
```

### 问题识别

1. **CLI 查询命令耦合度高**
   - `query.ts` 包含多个命令（roots, children, tree）
   - `node.ts` 和 `parents.ts` 独立但功能相似
   - 缺乏统一的查询接口和格式处理

2. **缺乏统一的 API 层**
   - CLI 直接调用底层功能
   - 没有标准化的 Node.js API 接口
   - 格式化逻辑散布在各个 CLI 文件中

3. **测试覆盖不足**
   - 只有少量手动测试
   - 缺乏自动化测试套件
   - 没有 API 层的单元测试

## 重构目标

### 架构目标
- 🏗️ **分层架构**：Core API → Service API → Interface Layer (CLI/HTTP)
- 🔧 **模块化**：功能独立、职责清晰
- 🧪 **可测试**：完善的单元测试和集成测试
- 🔄 **可扩展**：支持多种接口和输出格式
- 🔌 **可扩展**：支持多种接口和输出格式

### 功能目标
- 📊 **统一查询 API**：标准化的查询接口
- 🎨 **格式化抽象**：支持 markdown、JSON、YAML 等格式
- 🌐 **HTTP API**：RESTful 接口支持
- 📦 **Node.js API**：编程接口支持

## 重构计划

### 阶段 1：API 层重构 (Priority: High)

#### 1.1 创建核心 API 层
**目标文件**: `src/api/`
```
src/api/
├── index.ts           # API 统一入口
├── core/              # 核心功能 API
│   ├── parser-api.ts  # 解析 API
│   ├── query-api.ts   # 查询 API
│   └── stringify-api.ts # 字符串化 API
├── formatters/        # 格式化器
│   ├── base.ts        # 基础格式化器
│   ├── markdown.ts    # Markdown 格式化器
│   ├── json.ts        # JSON 格式化器
│   └── yaml.ts        # YAML 格式化器
└── types/             # API 类型定义
    └── api-types.ts
```

**功能点**:
- 统一的查询接口 (`QueryAPI`)
- 标准化的返回格式
- 格式化器抽象和实现
- 错误处理标准化

#### 1.2 查询功能统一
将分散的查询逻辑合并到统一的查询 API：
```typescript
interface QueryAPI {
  getRoots(file: string, options?: RootsOptions): Promise<RootsResult>;
  getChildren(file: string, nodeId: string, options?: ChildrenOptions): Promise<ChildrenResult>;
  getParents(file: string, nodeId: string, options?: ParentsOptions): Promise<ParentsResult>;
  getNodeInfo(file: string, nodeId: string, options?: NodeOptions): Promise<NodeResult>;
  getTreeStructure(file: string, nodeId?: string, options?: TreeOptions): Promise<TreeResult>;
}
```

### 阶段 2：CLI 重构 (Priority: High)

#### 2.1 CLI 命令拆分
**目标结构**: `cli/commands/`
```
cli/
├── index.ts           # CLI 主入口
├── commands/          # 命令实现
│   ├── parse.ts       # 解析命令
│   ├── stringify.ts   # 字符串化命令
│   ├── roots.ts       # 根节点查询
│   ├── children.ts    # 子节点查询
│   ├── parents.ts     # 父节点查询
│   ├── node.ts        # 节点详情
│   └── tree.ts        # 树结构
├── formatters/        # CLI 格式化
│   ├── table.ts       # 表格格式化
│   └── output.ts      # 输出工具
└── utils/             # CLI 工具
    └── help.ts        # 帮助格式化
```

#### 2.2 CLI 适配器模式
每个 CLI 命令都通过统一的 API 层访问功能：
```typescript
// cli/commands/roots.ts
import { createQueryAPI } from '../../src/api';

export async function rootsCommand(file: string, options: any) {
  const api = createQueryAPI();
  const result = await api.getRoots(file, options);
  // 格式化输出
  formatOutput(result, options.format);
}
```

### 阶段 3：HTTP API 开发 (Priority: Medium)

#### 3.1 HTTP 服务器
**目标文件**: `server/`
```
server/
├── index.ts           # 服务器入口
├── routes/            # 路由定义
│   ├── parse.ts       # POST /api/parse
│   ├── query.ts       # GET /api/query/*
│   └── stringify.ts   # POST /api/stringify
├── middleware/        # 中间件
│   ├── cors.ts        # CORS 支持
│   ├── error.ts       # 错误处理
│   └── validation.ts  # 参数验证
└── types/             # HTTP 类型定义
    └── http-types.ts
```

#### 3.2 RESTful API 设计
```
POST /api/parse          # 解析 TypeScript 代码
GET  /api/ast/:id/roots  # 获取根节点
GET  /api/ast/:id/node/:nodeId # 获取节点信息
GET  /api/ast/:id/children/:nodeId # 获取子节点
GET  /api/ast/:id/parents/:nodeId  # 获取父节点
GET  /api/ast/:id/tree/:nodeId?    # 获取树结构
POST /api/stringify      # 生成 TypeScript 代码
```

### 阶段 4：测试框架构建 (Priority: High)

#### 4.1 测试结构
**目标结构**: `tests/`
```
tests/
├── unit/              # 单元测试
│   ├── api/           # API 层测试
│   ├── core/          # 核心功能测试
│   └── formatters/    # 格式化器测试
├── integration/       # 集成测试
│   ├── cli/           # CLI 测试
│   └── http/          # HTTP API 测试
├── fixtures/          # 测试固件
│   ├── ast-samples/   # AST 示例文件
│   └── ts-samples/    # TypeScript 示例文件
└── utils/             # 测试工具
    ├── mock.ts        # Mock 工具
    └── helpers.ts     # 测试助手
```

#### 4.2 测试类型
1. **单元测试**
   - 核心 API 功能测试
   - 格式化器测试
   - 工具函数测试

2. **集成测试**
   - CLI 命令端到端测试
   - HTTP API 端到端测试
   - 多格式输出测试

3. **性能测试**
   - 大文件解析性能
   - 查询响应时间
   - 内存使用情况

### 阶段 5：文档和工具完善 (Priority: Low)

#### 5.1 API 文档
- Node.js API 文档 (TypeDoc)
- HTTP API 文档 (OpenAPI/Swagger)
- CLI 使用文档更新

#### 5.2 开发工具
- 自动化测试 CI/CD
- 代码质量检查 (ESLint, Prettier)
- 类型检查 (TypeScript strict mode)

## 实施路线图

### Sprint 1 (Week 1-2): 核心 API 重构
- [ ] 创建 `src/api/` 目录结构
- [ ] 实现核心查询 API (`QueryAPI`)
- [ ] 抽象格式化器 (`FormatterAPI`)
- [ ] 基础单元测试

### Sprint 2 (Week 3-4): CLI 重构
- [ ] 拆分 CLI 命令到 `cli/commands/`
- [ ] 适配 CLI 使用新的 API 层
- [ ] CLI 集成测试
- [ ] 确保功能向后兼容

### Sprint 3 (Week 5-6): HTTP API 开发
- [ ] 创建 HTTP 服务器
- [ ] 实现 RESTful 路由
- [ ] HTTP API 测试
- [ ] API 文档生成

### Sprint 4 (Week 7-8): 测试和优化
- [ ] 完善测试覆盖率 (>90%)
- [ ] 性能优化和基准测试
- [ ] 文档更新
- [ ] 发布准备

## 风险评估

### 技术风险
- **兼容性风险**: 重构可能破坏现有 CLI 接口
  - *缓解措施*: 保持 CLI 命令签名不变，内部实现重构

- **性能风险**: 新的抽象层可能影响性能
  - *缓解措施*: 基准测试和性能监控

### 项目风险
- **时间风险**: 重构工作量较大
  - *缓解措施*: 分阶段实施，确保每个阶段都能独立交付

- **测试风险**: 测试用例编写复杂
  - *缓解措施*: 先实现核心功能测试，逐步完善

## 成功标准

### 功能标准
- ✅ CLI 功能完全保持兼容
- ✅ 新增 Node.js API 接口
- ✅ 新增 HTTP API 接口
- ✅ 支持多种输出格式

### 质量标准
- ✅ 测试覆盖率 > 90%
- ✅ 所有 API 有完整的类型定义
- ✅ 性能不低于当前版本
- ✅ 内存使用优化

### 维护性标准
- ✅ 代码结构清晰，职责分离
- ✅ API 文档完整
- ✅ 易于添加新功能和格式
- ✅ 错误处理标准化

---

## 后续步骤

1. **评审本重构计划**
2. **创建详细的任务分解** (GitHub Issues)
3. **开始 Sprint 1 的实施**
4. **定期评估进度和调整计划**

此重构将使 Arbores 成为一个更加健壮、可扩展和易维护的 TypeScript AST 工具包。
