# Arbores 代码重构计划 - 基于 API 设计 v5

## 概述

本文档描述了基于 API 设计 v5 的 Arbores 项目重构计划，目标是构建一个函数式无状态的 API 层，支持 CLI、HTTP API 和 Node.js API 多种接口，并提供完善的测试覆盖。

## API 设计 v5 核心原则回顾

### 函数式无状态设计
- 所有API为纯函数，状态通过参数传递
- 便于适配CLI和HTTP服务
- 可预测的行为，易于测试和调试

### 统一错误处理
- 使用`Result<T>`类型包装所有返回值
- 避免throw，错误通过返回值传递
- 类型安全的错误处理

### 数据存储外置
- API层不处理数据存储和缓存
- 状态管理由CLI/HTTP层负责
- API专注于业务逻辑

## 当前状况分析

### 现有项目结构
```
arbores/
├── cli/           # CLI 命令实现
│   ├── index.ts   # CLI 主程序和帮助格式化
│   ├── parse.ts   # 解析命令
│   ├── query.ts   # 查询命令 (roots, children, tree)
│   └── stringify.ts # 字符串化命令
├── src/           # 核心逻辑
│   ├── core/      # 核心 API 层
│   │   ├── parser.ts    # AST 解析
│   │   ├── stringify.ts # 代码生成
│   │   ├── types.ts     # 类型定义
│   │   ├── query.ts     # 查询功能
│   │   └── ast-builder/ # AST构建器
│   ├── cli/       # CLI 工具层
│   ├── utils.ts   # 工具函数
│   └── syntax-kind-names.ts # 语法类型名称
├── docs/          # 文档
└── samples/       # 示例文件
```

### 重构需求分析

1. **需要创建统一的API层**
   - 实现函数式无状态的API设计
   - 使用Result<T>类型进行错误处理
   - 将现有功能抽象为纯函数API

2. **CLI层需要重构为适配器模式**
   - CLI命令调用新的API层
   - 处理文件I/O和格式转换
   - 统一错误处理和输出格式

3. **需要完善的测试框架**
   - API层的单元测试
   - CLI的集成测试
   - 错误处理测试

## 重构目标

### 架构目标
- 🔧 **函数式API层**：基于API设计v5的纯函数式接口
- �️ **类型安全**：Result<T>类型统一错误处理
- 🧪 **可测试**：完善的单元测试和集成测试
- � **无状态设计**：数据存储和缓存外置到调用层
- 🔌 **适配器模式**：CLI/HTTP层作为API的适配器

### 功能目标
- 📊 **Parser API**：纯函数式的AST解析接口
- 🔍 **Query API**：统一的AST查询接口  
- 🎨 **Stringify API**：代码生成接口
- 🌐 **HTTP API就绪**：API层可直接用于HTTP服务
- � **统一错误处理**：标准化的错误码和消息

## 重构计划

### 阶段 1：核心API层实现 (Priority: High)

#### 1.1 创建API基础设施
**目标目录**: `src/core/`
```
src/core/
├── types.ts           # API类型定义和Result<T>
├── parser.ts          # 解析API实现
├── query.ts           # 查询API实现
├── stringify.ts       # 代码生成API实现
└── index.ts           # API统一导出
```

**核心实现**:
```typescript
// src/core/types.ts - 实现API设计v5的类型定义
export type ErrorCode = 'PARSE_ERROR' | 'NODE_NOT_FOUND' | 'INVALID_JSON' | 'INVALID_AST_STRUCTURE';
export class ArborError extends Error;
export type Result<T> = { success: true; data: T; } | { success: false; error: ArborError; };

// src/core/parser.ts - 纯函数式解析API
export function parseCode(sourceCode: string, baseAST: SourceFileAST): Result<ParseResult>;

// src/core/query.ts - 统一查询API
export function getRoots(ast: SourceFileAST): Result<VersionInfo[]>;
export function getNode(ast: SourceFileAST, nodeId: string): Result<NodeInfo>;
export function getChildren(ast: SourceFileAST, nodeId: string): Result<NodeInfo[]>;
export function getParents(ast: SourceFileAST, nodeId: string): Result<NodeInfo[]>;

// src/core/stringify.ts - 代码生成API
export function stringifyNode(ast: SourceFileAST, nodeId: string, options?: StringifyOptions): Result<string>;
export function stringifyAST(ast: SourceFileAST, version?: string, options?: StringifyOptions): Result<string>;
```

#### 1.2 核心逻辑重构
- 重构现有的`src/parser.ts`适配新的API接口
- 重构现有的`src/stringifier.ts`适配新的API接口
- 从CLI代码中提取查询逻辑到核心模块

### 阶段 2：CLI适配器重构 (Priority: High)

#### 2.1 CLI命令适配
**重构现有CLI命令使用新的API层**:
```
cli/
├── index.ts           # CLI主入口 (保持不变)
├── parse.ts           # 重构为API适配器
├── query.ts           # 重构为API适配器 
├── stringify.ts       # 重构为API适配器
└── utils/             # CLI工具函数
    ├── file-io.ts     # 文件I/O处理
    ├── format.ts      # 输出格式处理
    └── error.ts       # CLI错误处理
```

**适配器模式实现**:
```typescript
// cli/parse.ts - 使用新的Parser API
import { parseCode } from '../src/core/parser';
import { loadAST, saveAST } from './utils/file-io';

export async function parseCommand(sourceFile: string, options: ParseOptions) {
  const sourceCode = await fs.readFile(sourceFile, 'utf-8');
  const baseAST = options.astFile ? await loadAST(options.astFile) : createEmptyAST();
  
  const result = parseCode(sourceCode, baseAST);
  if (!result.success) {
    handleCLIError(result.error);
    return;
  }
  
  if (options.astFile) {
    await saveAST(options.astFile, result.data.ast);
  }
  
  formatOutput(result.data, options);
}
```

#### 2.2 文件I/O和格式处理
- 将文件读写逻辑集中到`cli/utils/file-io.ts`
- 将格式转换逻辑集中到`cli/utils/format.ts`
- CLI层负责JSON/YAML转换，API层只处理数据结构

### 阶段 3：测试框架构建 (Priority: High)

#### 3.1 测试结构设计
**目标结构**: 测试文件与被测文件同目录下的`__tests__`文件夹
```
src/
├── api/               # API层
│   ├── __tests__/     # API层单元测试
│   │   ├── types.test.ts     # 类型和错误处理测试
│   │   ├── parser.test.ts    # Parser API测试
│   │   ├── query.test.ts     # Query API测试
│   │   └── stringify.test.ts # Stringify API测试
│   ├── types.ts
│   ├── parser.ts
│   ├── query.ts
│   └── stringify.ts
├── core/              # 核心逻辑
│   └── __tests__/     # 核心逻辑测试
└── ...

cli/                   # CLI适配器层
├── __tests__/         # CLI集成测试
│   ├── parse.test.ts  # CLI解析命令测试
│   ├── query.test.ts  # CLI查询命令测试
│   └── stringify.test.ts # CLI代码生成测试
└── ...
```

**测试文件组织原则**:
- 测试文件放在被测文件相同目录的`__tests__`文件夹下
- 便于关联检索和代码导航
- 测试文件命名为`*.test.ts`格式
- 每个测试文件对应一个主要模块

#### 3.2 测试重点
1. **API层纯函数测试**
   - 每个API函数的正常情况和边界情况
   - Result<T>类型的错误处理测试
   - 数据转换正确性验证

2. **CLI适配器测试**
   - 命令行参数解析
   - 文件I/O操作
   - 输出格式验证

3. **端到端测试**
   - 真实TypeScript文件的完整流程测试
   - 复杂AST的往返转换测试

### 阶段 4：HTTP API准备 (Priority: Medium)

#### 4.1 HTTP适配器设计
由于API层采用纯函数设计，HTTP服务器可以直接使用：
```typescript
// server/routes/parse.ts
import { parseCode } from '../../src/core/parser';

export async function parseRoute(req: Request, res: Response) {
  const { sourceCode, baseAST } = req.body;
  
  const result = parseCode(sourceCode, baseAST || createEmptyAST());
  
  if (result.success) {
    res.json({ success: true, data: result.data });
  } else {
    res.status(400).json({ success: false, error: result.error.message });
  }
}
```

#### 4.2 无状态服务设计
- HTTP服务器不维护AST状态
- 每个请求都包含完整的AST数据
- 支持客户端缓存和状态管理

### 阶段 5：文档和工具完善 (Priority: Low)

#### 5.1 API文档生成
- 基于TypeScript类型的自动文档生成
- API使用示例和最佳实践
- 错误处理指南

#### 5.2 开发工具优化
- 自动化测试CI/CD流程
- 代码质量检查工具集成
- 性能基准测试自动化

## 实施路线图

### Phase 1 (Week 1-2): 核心API类型和解析器
- [x] 创建`src/core/types.ts`实现Result<T>和错误类型
- [x] 实现`src/core/parser.ts`的parseCode函数
- [x] 集成现有parser逻辑到新API
- [x] 编写Parser API的单元测试

### Phase 2 (Week 3-4): 查询和代码生成API  
- [ ] 实现`src/core/query.ts`的所有查询函数
- [ ] 实现`src/core/stringify.ts`的代码生成函数
- [ ] 从CLI代码中提取查询逻辑
- [ ] 完成Query和Stringify API的单元测试

### Phase 3 (Week 5-6): CLI适配器重构
- [ ] 重构`cli/parse.ts`使用新Parser API
- [ ] 重构`cli/query.ts`使用新Query API  
- [ ] 重构`cli/stringify.ts`使用新Stringify API
- [ ] 实现CLI工具函数(file-io, format, error)
- [ ] CLI集成测试确保向后兼容

### Phase 4 (Week 7-8): 测试完善和HTTP API准备
- [ ] 完善所有API的单元测试(>90%覆盖率)
- [ ] 实现端到端集成测试
- [ ] 性能基准测试和优化
- [ ] HTTP API适配器设计和原型验证

## 风险评估和缓解措施

### 技术风险

#### 兼容性风险
- **风险**: 重构可能破坏现有CLI接口
- **缓解**: 保持CLI命令签名完全不变，只重构内部实现
- **验证**: 完整的CLI回归测试套件

#### Result<T>类型学习曲线
- **风险**: 团队需要适应函数式错误处理
- **缓解**: 提供详细的错误处理文档和示例
- **验证**: 错误处理的单元测试覆盖

### 项目风险

#### 重构范围控制
- **风险**: 重构范围过大，影响交付
- **缓解**: 分阶段实施，每个Phase独立可交付
- **验证**: 每个Phase结束都有可运行的版本

#### 测试用例完整性
- **风险**: 测试用例不足导致回归问题
- **缓解**: 在重构前先补齐现有功能的测试用例
- **验证**: 测试覆盖率指标和质量门禁

## 成功标准

### 功能标准
- ✅ CLI功能完全保持兼容，用户无感知
- ✅ 新增函数式Node.js API接口
- ✅ API层支持直接用于HTTP服务
- ✅ 统一的Result<T>错误处理

### 质量标准  
- ✅ API层单元测试覆盖率 > 95%
- ✅ CLI集成测试覆盖率 > 90%
- ✅ 所有API函数都有完整的TypeScript类型
- ✅ 性能不低于当前版本

### 架构标准
- ✅ API层完全无状态，纯函数式设计
- ✅ 清晰的分层架构，职责分离
- ✅ 统一的错误处理和类型安全
- ✅ 易于扩展新功能和接口

---

## 后续步骤

1. **确认重构计划和优先级**
2. **创建详细的任务分解**(GitHub Issues)  
3. **开始Phase 1的API类型定义和Parser API实现**
4. **建立CI/CD流程确保代码质量**

此重构将使Arbores具备现代化的函数式API架构，为未来的HTTP API和其他接口扩展奠定坚实基础。

---

*基于API设计v5更新*  
*更新时间：2025年7月20日*  
*版本：v2.0*  
*状态：规划阶段*
