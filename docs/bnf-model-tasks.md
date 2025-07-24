# BNF 模型实现任务清单

## 🎯 项目目标
基于 BNF 的语法规则模型，支持 TypeScript AST 转换和代码生成。

## 📋 任务进度跟踪

### Phase 1: 核心 BNF 模型基础设施
- [ ] **1.1 核心类型定义** (`src/core/bnf-model/types.ts`) 
  - [ ] BaseNode, TokenNode, DeductionNode, UnionNode 类型
  - [ ] TokenPattern, DeductionElement 辅助类型  
  - [ ] BNFModel 根类型
  
- [ ] **1.2 模型验证器** (`src/core/bnf-model/validator.ts`)
  - [ ] BNF 模型完整性验证
  - [ ] 节点类型和引用关系检查
  - [ ] Token 模式和正则表达式验证
  - [ ] DeductionElement 属性命名检查
  
- [ ] **1.3 语法树生成器** (`src/core/bnf-model/generator.ts`)
  - [ ] TypeScript 类型定义生成
  - [ ] 文件结构管理 (token-types.ts, node/*.ts 等)
  - [ ] 依赖关系和导入语句处理
  - [ ] 常量注册表生成

### Phase 2: 命令行工具开发  
- [ ] **2.1 BNF 模型工具脚本** (`scripts/bnf-model.ts`)
  - [ ] `validate` 子命令实现
  - [ ] `generate schema` 子命令实现  
  - [ ] `generate stringify` 子命令实现
  - [ ] package.json 脚本注册
  
- [ ] **2.2 字符串化生成器** (`src/core/bnf-model/stringify-generator.ts`)
  - [ ] 递归代码字符串化函数生成
  - [ ] Token 和 Deduction 节点输出逻辑
  - [ ] 格式化选项和缩进控制

### Phase 3: TypeScript 语言支持
- [ ] **3.1 TypeScript 语法规则模型** (`src/core/languages/typescript/syntax.bnf.ts`)
  - [ ] Token 定义 (关键字、标识符、字面量)
  - [ ] 语句推导规则
  - [ ] 表达式推导规则  
  - [ ] 声明推导规则
  - [ ] 联合类型定义
  - [ ] SyntaxKind 元数据映射
  
- [ ] **3.2 自动生成 Schema** (`src/core/languages/typescript/schema/`)
  - [ ] 运行生成器产生类型定义
  - [ ] Token 常量注册表
  - [ ] 优先级和结合性注册表
  
- [ ] **3.3 字符串化函数生成** (`src/core/languages/typescript/stringify.ts`)
  - [ ] 自动生成字符串化函数
  - [ ] 格式化和美化输出支持

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
- [ ] **5.1 单元测试** (`src/core/bnf-model/__tests__/`)
  - [ ] BNF 模型验证器测试
  - [ ] 语法树生成器测试
  - [ ] 字符串化函数测试
  - [ ] TypeScript 转换器测试
  
- [ ] **5.2 端到端测试** (`src/core/languages/typescript/__tests__/`)
  - [ ] 往返一致性测试
  - [ ] 复杂语法结构测试
  - [ ] 性能基准测试
  
- [ ] **5.3 文档和示例**
  - [ ] BNF 模型使用指南
  - [ ] TypeScript BNF 架构文档
  - [ ] 使用示例和教程

## 🏃‍♂️ 快速开始检查清单

开始 Phase 1 之前的准备工作：

- [ ] 创建目录结构
  ```
  src/core/bnf-model/
  src/core/languages/typescript/
  scripts/
  docs/
  ```

- [ ] 更新 package.json 依赖
  - [ ] 添加 commander (用于 CLI)
  - [ ] 确保 TypeScript 相关依赖完整

- [ ] 建立基础测试结构
  - [ ] 配置测试框架 (已有 Bun)
  - [ ] 创建测试目录结构

## 🔄 迭代策略

每个 Phase 完成后：
1. 运行现有测试确保不破坏已有功能
2. 提交代码并打标签 
3. 更新文档
4. 进行代码审查

## 📊 进度报告模板

```markdown
## 本周进度 (Week X)
- ✅ 已完成: [任务列表]
- 🔄 进行中: [任务列表] 
- ❌ 遇到问题: [问题描述和解决方案]
- 📅 下周计划: [任务列表]
```

## 🎯 里程碑时间点

- **Week 1**: Phase 1 完成 - 核心 BNF 模型基础设施
- **Week 2**: Phase 2-3 完成 - 命令行工具 + TypeScript 语法支持  
- **Week 3**: Phase 4-5 完成 - 转换器 + 测试集成

---
*最后更新: 2025-07-24*
