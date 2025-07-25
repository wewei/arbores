# BNF 模型实现任务清单

## 🎯 项目目标
基于 BNF 的语法规则模型，支持 TypeScript AST 转换和代码生成。

## 📋 任务进度跟踪

### Phase 1: 核心 BNF 模型基础设施
- [x] **1.1 核心类型定义** (`src/core/bnf-model/types.ts`) *(已完成)*
  - [x] BaseNode, TokenNode, DeductionNode, UnionNode 类型
  - [x] TokenPattern, DeductionElement 辅助类型  
  - [x] BNFModel 根类型
  - [x] TypeScript 元数据支持
  - [x] 代码生成相关类型
  
- [x] **1.2 BNF 模型解析器** (`src/core/bnf-model/bnf-parser.ts`) *(已完成)*
  - [x] BNF 模型类型安全解析
  - [x] `parseBNF<M>()` 函数实现 (输入: any, 输出: 成功/失败结果)
  - [x] 节点类型和引用关系检查
  - [x] Token 模式和正则表达式验证
  - [x] DeductionElement 属性命名检查
  - [x] JSON/YAML 输入支持
  - [x] 移除循环依赖检测 (BNF 中递归引用是合法的)
  - [x] 完整的测试覆盖 (14 个测试用例全部通过)
  
- [x] **1.3 语法树生成器** (`src/core/bnf-model/generator.ts`) *(已完成)*
  - [x] TypeScript 类型定义生成 (Token interfaces, Union types, Deduction nodes)
  - [x] 文件结构管理 (token-types.ts, nodes/*.ts, union-types.ts, constants.ts, index.ts)
  - [x] 依赖关系和导入语句处理 (自动生成正确的 import 语句)
  - [x] 常量注册表生成 (TOKEN_PATTERNS, PRECEDENCE, ASSOCIATIVITY)
  - [x] **代码质量检查**: 基础 TypeScript 语法验证和类型检查
  - [x] 可配置的命名约定和文档生成
  - [x] 完整的测试覆盖 (12 个测试用例 + 演示脚本验证)

### Phase 2: 命令行工具开发  
- [x] **2.1 字符串化生成器** (`src/core/bnf-model/stringify-generator.ts`) *(已完成)*
  - [x] 递归代码字符串化函数生成
  - [x] Token 和 Deduction 节点输出逻辑
  - [x] 格式化选项和缩进控制
  - [x] StringifyGenerator 类实现
  - [x] 主调度函数和类型特定的字符串化函数
  - [x] 配置选项支持 (函数前缀、缩进风格、空格格式化)
  - [x] 完整的测试覆盖 (17 个测试用例全部通过)
  - [x] 演示脚本验证 (scripts/demo-stringify-generator.ts)

- [x] **2.2 BNF 模型工具脚本** (`scripts/bnf-model.ts`) *(已完成)*
  - [x] `validate` 子命令实现
  - [x] `generate schema` 子命令实现  
  - [x] `generate stringify` 子命令实现 (依赖 2.1 - ✅ 已完成)
  - [x] package.json 脚本注册
  - [x] 完整的 commander.js 帮助信息
  - [x] 彩色输出和详细错误处理
  - [x] 支持 JSON/YAML 输入格式
  - [x] 默认输出到 stdout，-o 参数写入文件

### Phase 3: TypeScript 语言支持
- [ ] **3.1 TypeScript 语法规则模型** (`src/core/languages/typescript/syntax.bnf.ts`)
  - [ ] **第一步**: 基于所有 SyntaxKind 自动生成 TokenNode 和 DeductionNode 的基础框架
  - [ ] **第二步**: 手工逐步补全和完善语法规则定义
  - [ ] Token 定义 (关键字、标识符、字面量)
  - [ ] 语句推导规则
  - [ ] 表达式推导规则  
  - [ ] 声明推导规则
  - [ ] 联合类型定义
  - [ ] SyntaxKind 元数据映射
  - [ ] **注意**: 生成架子 + 手工补全的混合模式
  
- [ ] **3.2 自动生成 Schema** (`src/core/languages/typescript/schema/`)
  - [ ] 运行生成器产生类型定义
  - [ ] Token 常量注册表
  - [ ] 优先级和结合性注册表
  - [ ] **验证**: 确保生成的类型定义质量
  
- [ ] **3.3 字符串化函数生成** (`src/core/languages/typescript/stringify.ts`)
  - [ ] 自动生成字符串化函数
  - [ ] 格式化和美化输出支持
  - [ ] **验证**: 确保生成的函数正确性

### Phase 4: TypeScript 转换器
- [ ] **4.1 转换器脚本生成** (`scripts/generate-from-ts-node.ts`)  
  - [ ] 基于 BNF 模型生成转换函数
  - [ ] ts.Node → BNF 语法树映射
  - [ ] 递归转换逻辑实现
  
- [ ] **4.2 转换器实现** (`src/core/languages/typescript/fromTsNode/`)
  - [ ] 自动生成转换函数集合
  - [ ] 通用节点转换器 (switch-case)
  - [ ] SyntaxKind 专用转换函数

### Phase 5: 集成与测试
- [ ] **5.1 单元测试** (`src/core/bnf-model/__tests__/`) **[穿插开发]**
  - [ ] BNF 模型验证器测试
  - [ ] 语法树生成器测试
  - [ ] 字符串化函数测试
  - [ ] TypeScript 转换器测试
  - [ ] **重要**: 不要延迟到最后，在各个核心模块开发过程中同步编写测试
  
- [ ] **5.2 端到端测试** (`src/core/languages/typescript/__tests__/`) **[CLI 功能测试]**
  - [ ] 往返一致性测试
  - [ ] 复杂语法结构测试
  - [ ] 性能基准测试
  - [ ] CLI 命令端到端测试
  - [ ] **注意**: 这是 CLI 实现的一部分，不是独立的测试阶段
  
- [ ] **5.3 文档和示例** **[持续更新]**
  - [ ] BNF 模型使用指南
  - [ ] TypeScript BNF 架构文档
  - [ ] 使用示例和教程
  - [ ] **注意**: 随开发进度同步更新文档

## 🏃‍♂️ 快速开始检查清单

开始 Phase 1 之前的准备工作：

- [x] 创建目录结构 *(已完成)*
  ```
  src/core/bnf-model/
  src/core/languages/typescript/
  scripts/
  docs/
  ```

- [ ] 更新 package.json 依赖
  - [ ] 添加 commander (用于 CLI)
  - [x] 确保 TypeScript 相关依赖完整 *(已完成)*

- [ ] 建立基础测试结构
  - [x] 配置测试框架 (已有 Bun) *(已完成)*
  - [ ] 创建测试目录结构

## 🔄 迭代策略

### Vibe Coding 方法
- **探索性开发**: 不设定严格时间限制，重在质量和探索
- **持续验证**: 每个模块都要确保生成的代码语法和类型正确
- **TDD 方式**: 单元测试穿插在各个核心模块开发过程中
- **文档同步**: 重要更改随时更新相关文档

### 每个模块完成后：
1. 运行现有测试确保不破坏已有功能
2. 验证生成的代码质量（语法和类型正确性）
3. 提交代码并记录进展
4. 更新相关文档

## 📊 进度报告模板

```markdown
## 本周进度 (Week X)
- ✅ 已完成: [任务列表]
- 🔄 进行中: [任务列表] 
- ❌ 遇到问题: [问题描述和解决方案]
- 📅 下周计划: [任务列表]
```

## 📈 最新进度报告

### 2025-07-25 进度更新 - Phase 1 完成
- ✅ **已完成**: 
  - Phase 1.1: 核心类型定义 (types.ts) - 完整的 BNF 模型类型系统
  - Phase 1.2: BNF 模型解析器 (bnf-parser.ts) - 类型安全的解析和验证
  - Phase 1.3: 语法树生成器 (generator.ts) - 完整的 TypeScript 代码生成
  - **Phase 1 里程碑**: 核心 BNF 模型基础设施全部完成 🎉
  - 测试基础设施: 26 个测试用例全部通过，支持 YAML/JSON fixture
  - 演示脚本: 成功生成可用的 TypeScript 代码并验证质量

- 🔄 **进行中**: 
  - Phase 2.1: 字符串化生成器 - 准备开始实现 (CLI 工具的前置条件)

- 📅 **下期计划**: 
  - 完成 Phase 2.1: 字符串化生成器实现
  - 开始 Phase 2.2: CLI 工具脚本开发

## 🎯 开发重点

### 关键原则
- **质量优先**: 生成的 TypeScript 代码必须语法和类型正确
- **混合开发**: Phase 3 采用生成架子 + 手工补全模式
- **测试驱动**: 单元测试贯穿整个开发过程
- **依赖管理**: 注意 Phase 2 的开发顺序调整

### 里程碑目标
- **Phase 1**: 建立可靠的 BNF 模型基础设施
- **Phase 2**: 完成支持代码生成的命令行工具  
- **Phase 3**: 实现完整的 TypeScript 语法支持
- **Phase 4**: 建立 ts.Node 到 BNF 的转换能力
- **Phase 5**: 通过完整的测试和文档验证

---
*最后更新: 2025-07-25 - 🎉 Phase 1 核心 BNF 模型基础设施完成*  
*开发方法: Vibe Coding - 探索性质量驱动开发*
