# CLI End-to-End Testing Framework

## 概述

这个框架提供了一个基于测试基准（test fixtures）的端到端测试解决方案，用于验证 CLI 命令的输出一致性。

## 架构设计

### 1. 测试基准生成器（Test Baseline Generator）

**脚本位置**: `scripts/generate-e2e-baseline.ts`

**功能**:
- 执行指定的 CLI 命令
- 通过环境变量模拟终端宽度和时间戳
- 记录命令的 stdout 和 stderr 输出
- 将结果保存为测试基准文件

**用法**:
```bash
# 基本用法
bun scripts/generate-e2e-baseline.ts \
  --command "parse src/cli/__tests__/fixtures/simple.ts" \
  --width 80 \
  --timestamp "2025-01-01T00:00:00.000Z" \
  --output src/cli/__tests__/e2e/baselines/parse

# 批量生成
bun scripts/generate-e2e-baseline.ts \
  --batch src/cli/__tests__/e2e/test-scenarios.json
```

### 2. 测试基准文件结构

```
src/cli/__tests__/e2e/baselines/
├── parse/
│   ├── simple-ts-to-json/
│   │   ├── metadata.yaml        # 测试元数据（包含命令和退出码）
│   │   ├── stdout.txt           # 标准输出（有内容时才存在）
│   │   └── stderr.txt           # 错误输出（有内容时才存在）
│   ├── simple-ts-to-yaml/
│   └── ...
├── stringify/
├── tree/
└── ...
```

**文件说明**:
- `metadata.yaml`: 包含命令、退出码、环境变量等所有元数据
- `stdout.txt`: 仅在有标准输出时存在
- `stderr.txt`: 仅在有错误输出时存在

### 3. 测试执行器（Test Runner）

**位置**: `src/cli/__tests__/e2e/baseline-runner.test.ts`

**功能**:
- 自动发现测试基准文件
- 执行对应的命令
- 对比实际输出与期望输出
- 支持时间戳和路径的动态替换

### 4. 环境变量模拟

支持的模拟环境变量：
- `COLUMNS`: 终端宽度
- `MOCK_TIMESTAMP`: 固定时间戳，用于替换动态时间

## 实现细节

### 基准文件格式

#### metadata.yaml
```yaml
description: "Parse simple TypeScript file to JSON"
command: ["parse", "src/cli/__tests__/fixtures/simple.ts", "--format", "json"]
exitCode: 0
environment:
  COLUMNS: "80"
  MOCK_TIMESTAMP: "2025-01-01T00:00:00.000Z"
created: "2025-07-20T22:30:00.000Z"
updated: "2025-07-20T22:30:00.000Z"
```

#### stdout.txt / stderr.txt
原始的命令输出内容（仅在有输出时创建文件）

### 动态内容处理

对于包含动态内容的输出，使用占位符进行标准化：

- 时间戳: `{{TIMESTAMP}}` 
- 临时路径: `{{TEMP_PATH}}`
- 文件路径: `{{FILE_PATH}}`
- 节点ID: `{{NODE_ID}}`

## 使用流程

### 1. 生成测试基准

```bash
# 为 parse 命令生成基准
bun scripts/generate-e2e-baseline.ts \
  --command "parse src/cli/__tests__/fixtures/simple.ts --format json" \
  --width 80 \
  --timestamp "2025-01-01T00:00:00.000Z" \
  --output src/cli/__tests__/e2e/baselines/parse/simple-json

# 为 tree 命令生成基准（测试终端宽度适配）
bun scripts/generate-e2e-baseline.ts \
  --command "tree /path/to/ast.json" \
  --width 40 \
  --output src/cli/__tests__/e2e/baselines/tree/narrow-width
```

### 2. 执行测试

```bash
# 运行所有基准测试
bun test src/cli/__tests__/e2e/baseline-runner.test.ts

# 运行特定命令的测试
bun test src/cli/__tests__/e2e/baseline-runner.test.ts -t "parse"
```

### 3. 更新测试基准

```bash
# 重新生成所有基准
bun scripts/generate-e2e-baseline.ts --update-all

# 重新生成特定基准
bun scripts/generate-e2e-baseline.ts \
  --update src/cli/__tests__/e2e/baselines/parse/simple-json
```

## 优势

1. **一致性**: 确保命令输出的一致性
2. **可维护性**: 基准文件易于查看和更新
3. **灵活性**: 支持各种环境参数的模拟
4. **自动化**: 批量生成和执行测试
5. **可追溯性**: 记录测试基准的创建和更新时间

## 测试场景覆盖

### Parse 命令
- 基本解析（JSON/YAML/Markdown）
- 文件合并
- 错误处理
- 详细模式

### Stringify 命令  
- 不同输出格式（compact/readable/minified）
- 特定节点输出
- 错误处理

### Tree 命令
- 不同终端宽度（20/40/80/120列）
- 注释显示
- 节点选择

### Query 命令（roots/children/parents/node）
- 不同输出格式
- 详细信息显示
- 错误处理

## 维护指南

### 添加新的测试场景
1. 使用生成器脚本创建新的基准
2. 确认输出正确性
3. 提交基准文件到版本控制

### 更新现有测试
1. 修改命令或期望输出后，重新运行生成器
2. 对比差异，确认更改合理
3. 更新基准文件

### 调试失败的测试
1. 查看具体的输出差异
2. 使用 `--verbose` 模式获取详细信息  
3. 必要时重新生成基准文件
