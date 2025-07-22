# CLI End-to-End Testing Framework & Test Suite Organization

## Test Suites Overview

The testing suite is organized into different categories for better management and targeted testing:

### 🧪 Unit Tests (ut)
- **Location**: `src/**/__tests__/**/*.test.ts` (excluding e2e)
- **Command**: `npm run test:ut`
- **Purpose**: Test individual functions and modules in isolation
- **Files**:
  - `src/core/__tests__/parser.test.ts` - Parser API tests
  - `src/core/__tests__/query.test.ts` - Query API tests  
  - `src/core/__tests__/stringify.test.ts` - Stringify API tests
  - `src/core/__tests__/types.test.ts` - Type system tests

### 📊 Baseline Tests (baseline)
- **Location**: `src/cli/__tests__/e2e/baseline-runner.test.ts`
- **Command**: `npm run test:baseline`
- **Purpose**: Validate CLI commands against known baseline outputs
- **Features**: Auto-discovers baseline files and compares actual vs expected output

### 🔄 Roundtrip Tests (roundtrip)
- **Location**: `src/cli/__tests__/e2e/roundtrip.test.ts`
- **Command**: `npm run test:roundtrip`
- **Purpose**: Test curated TypeScript files for perfect roundtrip consistency
- **Features**: 
  - Tests handpicked fixture files (15 files)
  - High success rate expected (100%)
  - Fast execution (~20 seconds)
  - AST-level comparison with intelligent diffing

### 🚀 Full Roundtrip Tests (full-roundtrip)
- **Location**: `src/cli/__tests__/e2e/full-roundtrip.test.ts`
- **Command**: `npm run test:full-roundtrip`
- **Purpose**: Comprehensive testing of all source files in the project
- **Features**:
  - Tests all TypeScript files in `src/` directory (43+ files)
  - Longer execution time (~30+ seconds)
  - Success rate tracking with minimum threshold (70%)
  - Categorizes files by complexity and automatically skips problematic ones

### 🎯 Test Commands

```bash
# Default: Run all tests except full-roundtrip (fastest feedback)
npm run test

# Individual test suites
npm run test:ut              # Unit tests only
npm run test:baseline        # Baseline tests only  
npm run test:roundtrip       # Curated roundtrip tests only
npm run test:full-roundtrip  # Complete roundtrip tests (slow)

# Combined suites
npm run test:e2e            # All E2E tests (baseline + roundtrip, excluding full-roundtrip)
npm run test:all            # All tests including full-roundtrip
```

### 🏃‍♂️ Development Workflow

1. **During development**: Use `npm run test` (excludes slow full-roundtrip)
2. **Before commits**: Run `npm run test:e2e` to validate E2E functionality
3. **Before releases**: Run `npm run test:all` for comprehensive validation
4. **CI/CD pipeline**: Use `npm run test:all` for full coverage

### 📈 Success Rate Expectations

- **Unit Tests**: 100% (all must pass)
- **Baseline Tests**: 100% (all must pass)  
- **Roundtrip Tests**: 100% (curated fixtures should always work)
- **Full Roundtrip Tests**: 70%+ (comprehensive real-world files)

### 🔍 Debugging Failed Tests

Each test category provides different levels of detail:

- **Unit tests**: Standard Jest-style output with expect assertions
- **Baseline tests**: Diff output comparing expected vs actual CLI results
- **Roundtrip tests**: AST node-level comparison with path information
- **Full roundtrip tests**: Batch results with file categorization and summary stats

---

# Original CLI E2E Framework Documentation

## 概述

这个框架提供了一个基于测试基准（test fixtures）的端到端测试解决方案，用于验证 CLI 命令的输出一致性。经过实际项目实践，我们总结了一套完整的 CLI e2e 测试最佳实践。

## 核心设计原则

### 1. 确定性输出（Deterministic Output）
- **时间戳标准化**: 使用 `MOCK_TIMESTAMP` 环境变量固定时间戳
- **路径标准化**: 自动替换项目根目录和临时路径
- **ID 标准化**: 基于内容哈希的稳定节点ID生成

### 2. 环境隔离（Environment Isolation）
- **终端模拟**: 通过 `COLUMNS` 环境变量控制输出宽度
- **非交互模式**: 设置 `CI=true, TERM=dumb` 确保批处理模式
- **错误隔离**: 独立的错误输出捕获和验证

### 3. 优雅降级（Graceful Degradation）
- **占位符系统**: 对不支持的语法生成有意义的占位符
- **部分成功**: 允许部分功能失效，不影响整体测试
- **调试友好**: 提供详细的错误诊断信息

## 架构设计

### 1. 测试基准生成器（Test Baseline Generator）

**脚本位置**: `scripts/generate-e2e-baseline.ts`

**关键特性**:
- ✅ 环境变量注入和隔离
- ✅ 跨平台路径标准化  
- ✅ 确定性时间戳注入
- ✅ 自动输出标准化（BOM处理、换行符统一）
- ✅ 增量更新支持（`--update` 标志）

**用法**:
```bash
# 基本用法 - 生成单个测试基准
bun scripts/generate-e2e-baseline.ts \
  --command "parse src/cli/__tests__/fixtures/simple.ts --format json" \
  --width 80 \
  --timestamp "2025-01-01T00:00:00.000Z" \
  --output src/cli/__tests__/e2e/baselines/parse/simple-json

# 更新现有基准 - 覆盖已存在的测试
bun scripts/generate-e2e-baseline.ts \
  --command "tree src/cli/__tests__/fixtures/function-test.ast.json" \
  --width 120 \
  --output src/cli/__tests__/e2e/baselines/tree/wide-width \
  --update

# 带描述的基准生成
bun scripts/generate-e2e-baseline.ts \
  --command "stringify src/cli/__tests__/fixtures/complex.ast.json --format readable" \
  --description "Stringify complex AST with readable formatting" \
  --timestamp "2025-01-01T00:00:00.000Z" \
  --output src/cli/__tests__/e2e/baselines/stringify/complex-features
```

### 2. 测试基准文件结构

```
src/cli/__tests__/e2e/baselines/
├── parse/
│   ├── simple-json/
│   │   ├── metadata.yaml        # 测试元数据（命令、环境变量、退出码）
│   │   └── stdout.txt           # 期望的标准输出（仅在有内容时存在）
│   ├── simple-yaml/
│   └── verbose-mode/
│       ├── metadata.yaml
│       ├── stdout.txt
│       └── stderr.txt           # 期望的错误输出（仅在有内容时存在）
├── stringify/
│   ├── advanced-features/
│   ├── complex-features/
│   ├── control-flow/           # 控制流语句测试
│   └── export-statements/      # 导出语句测试
├── tree/
│   ├── narrow-width/           # 窄终端测试（40列）
│   ├── wide-width/             # 宽终端测试（120列）
│   └── narrow-with-comments/   # 带注释的窄终端测试
└── roots/
    ├── json-format/
    └── yaml-format/
```

**重要原则**:
- 📁 **目录命名**: 使用描述性名称，体现测试的核心特性
- 📄 **文件存在性**: 只保存有实际内容的输出文件（避免空的 stderr.txt）
- 🔧 **元数据完整性**: metadata.yaml 包含复现测试所需的全部信息

### 3. 测试执行器（Test Runner）

**位置**: `src/cli/__tests__/e2e/baseline-runner.test.ts`

**核心功能**:
- 🔍 **自动发现**: 递归扫描 baselines 目录
- ⚡ **并行执行**: 支持多个测试并行运行
- 🎯 **精确匹配**: 字节级输出比较
- 🛠 **智能诊断**: 详细的差异报告和调试信息

**执行策略**:
```bash
# 运行所有测试
bun test src/cli/__tests__/e2e/baseline-runner.test.ts

# 按命令过滤测试  
bun test --test-name-pattern "stringify" src/cli/__tests__/e2e/baseline-runner.test.ts

# 运行特定测试组
bun test --test-name-pattern "tree" src/cli/__tests__/e2e/baseline-runner.test.ts
```

### 4. 环境变量模拟系统

#### 支持的模拟变量
- `COLUMNS`: 终端宽度控制（用于 tree 命令的格式化）
- `MOCK_TIMESTAMP`: 固定时间戳（用于 parse 命令的时间一致性）  
- `DEBUG_UNSUPPORTED`: 调试模式开关（显示不支持的语法详情）

#### 环境注入机制
```typescript
// 在 executeCommand 函数中
const proc = spawn({
  cmd: ['bun', 'src/cli/index.ts', ...command],
  env: {
    ...process.env,      // 继承现有环境
    ...environment,      // 注入测试环境变量
    CI: 'true',          // 强制批处理模式
    TERM: 'dumb'         // 禁用交互式功能
  }
});
```

## 实际经验和技巧总结

### 🎯 核心经验（从修复38个测试中学到的）

#### 1. **环境变量是关键**
```yaml
# metadata.yaml 示例 - 正确的环境变量设置
environment:
  COLUMNS: "120"                           # 终端宽度控制
  MOCK_TIMESTAMP: "2025-01-01T00:00:00.000Z"  # 时间戳固定
```

**经验总结**:
- ✅ 确保CLI代码正确读取环境变量（如 `process.env.MOCK_TIMESTAMP`）
- ✅ 在代码中使用 `process.env.COLUMNS` 而不是 `process.stdout.columns`
- ⚠️ 忘记环境变量支持是测试失败的主要原因

#### 2. **文件路径标准化**
```yaml
# ❌ 错误 - 使用临时路径
command:
  - tree  
  - /tmp/function-test.ast.json

# ✅ 正确 - 使用项目相对路径
command:
  - tree
  - src/cli/__tests__/fixtures/function-test.ast.json
```

**经验总结**:
- 📂 始终使用项目相对路径，避免临时路径
- 🔧 生成基准前确保所有依赖文件存在
- 🌐 考虑跨平台路径兼容性（Windows vs Unix）

#### 3. **占位符系统设计**
```typescript
// 优雅降级而非致命错误
case ts.SyntaxKind.ForOfStatement:
  return ts.factory.createIdentifier(`/* Unsupported: ForOfStatement */`);

// 而不是
case ts.SyntaxKind.ForOfStatement:
  throw new Error(`Unsupported syntax: ForOfStatement`);
```

**经验总结**:
- 🛡️ **优雅降级** > 致命错误：生成有意义的占位符
- 🔍 **调试友好**: 占位符包含具体的语法类型信息
- 📊 **测试覆盖**: 确保占位符也在基准测试中验证

#### 4. **BOM和编码处理**
```typescript
// BOM处理在 compareOutput 函数中
function compareOutput(actual: string, expected: string): ComparisonResult {
  // 移除 UTF-8 BOM
  const normalizedActual = actual.replace(/^\uFEFF/, '');
  const normalizedExpected = expected.replace(/^\uFEFF/, '');
  
  // 标准化换行符
  const actualLines = normalizedActual.split(/\r?\n/);
  const expectedLines = normalizedExpected.split(/\r?\n/);
  
  return { matches: actualLines.join('\n') === expectedLines.join('\n') };
}
```

**经验总结**:
- 📝 **文件编码**: 使用ASCII编码保存AST文件避免BOM问题
- 🔄 **换行符处理**: 统一处理 `\r\n` vs `\n` 的差异
- ⚡ **PowerShell兼容**: 在Windows环境下注意编码问题

#### 5. **测试清理和维护**
```bash
# 清理空的输出文件
Get-ChildItem -Path "src\cli\__tests__\e2e\baselines" -Recurse -Filter "stderr.txt" | 
  Where-Object { $_.Length -eq 0 } | 
  Remove-Item -Force

# 重新生成损坏的基准
bun scripts/generate-e2e-baseline.ts --command "..." --update
```

**经验总结**:
- 🧹 **定期清理**: 移除空的 stderr.txt/stdout.txt 文件
- 🔄 **基准更新**: 代码变更后及时更新测试基准
- 📊 **完整覆盖**: 确保测试覆盖所有关键功能路径

### 🚀 高级技巧

#### 1. **测试隔离和调试**
```bash
# 单独运行特定测试进行调试
bun test --test-name-pattern "stringify/control-flow" src/cli/__tests__/e2e/baseline-runner.test.ts

# 查看详细的执行过程
DEBUG_UNSUPPORTED=1 bun src/cli/index.ts stringify src/cli/__tests__/fixtures/statements-test.ast.json
```

#### 2. **批量基准更新**
```bash
# 批量重新生成所有stringify测试
for dir in src/cli/__tests__/e2e/baselines/stringify/*/; do
  name=$(basename "$dir")
  bun scripts/generate-e2e-baseline.ts \
    --command "stringify src/cli/__tests__/fixtures/some-file.ast.json" \
    --timestamp "2025-01-01T00:00:00.000Z" \
    --output "$dir" \
    --update
done
```

#### 3. **错误诊断流程**
1. **查看测试输出差异** - 理解具体的失败原因
2. **检查环境变量支持** - 确认CLI代码正确处理环境变量
3. **验证文件依赖** - 确保所有输入文件存在且正确
4. **重新生成基准** - 使用 `--update` 标志更新基准文件
5. **验证修复结果** - 确认测试通过且输出符合预期

## 测试场景覆盖策略

### Parse 命令 ✅
- ✅ 基本解析（JSON/YAML格式）
- ✅ 时间戳一致性（MOCK_TIMESTAMP）
- ✅ 详细模式输出
- ✅ 错误处理（文件不存在）

### Stringify 命令 ✅  
- ✅ 多种输出格式（compact/readable）
- ✅ 复杂语法支持（泛型、类、接口）
- ✅ 占位符系统（未支持语法的优雅降级）
- ✅ 控制流语句（if/for/try-catch）
- ✅ 导出语句（各种export形式）
- ✅ 错误处理（文件不存在、节点不存在）

### Tree 命令 ✅
- ✅ 多种终端宽度（40/120列）
- ✅ 注释显示开关
- ✅ 宽度自适应布局
- ✅ 长注释截断处理

### Query 命令（roots/children/parents/node） ✅
- ✅ 多种输出格式（JSON/YAML/Markdown）
- ✅ 详细信息显示
- ✅ 错误处理（文件不存在、节点不存在）

## 维护指南和最佳实践

### 🎯 添加新的测试场景
1. **设计测试用例**: 明确测试的核心功能和边界条件
2. **准备测试数据**: 创建或使用现有的 fixture 文件
3. **生成基准**: 使用生成器脚本创建基准文件
4. **验证输出**: 人工检查生成的输出是否符合预期
5. **提交代码**: 将基准文件提交到版本控制

```bash
# 示例：添加新的stringify测试场景
bun scripts/generate-e2e-baseline.ts \
  --command "stringify src/cli/__tests__/fixtures/new-feature.ast.json --format compact" \
  --description "Stringify new syntax feature with compact format" \
  --timestamp "2025-01-01T00:00:00.000Z" \
  --output src/cli/__tests__/e2e/baselines/stringify/new-feature
```

### 🔄 更新现有测试
1. **分析变更影响**: 确定哪些测试可能受到代码变更影响  
2. **重新生成基准**: 使用 `--update` 标志更新相关基准
3. **对比差异**: 仔细检查输出变更是否合理
4. **回归测试**: 确保变更不会破坏其他功能

```bash
# 示例：更新stringify测试基准
bun scripts/generate-e2e-baseline.ts \
  --command "stringify src/cli/__tests__/fixtures/complex.ast.json" \
  --timestamp "2025-01-01T00:00:00.000Z" \
  --output src/cli/__tests__/e2e/baselines/stringify/complex-features \
  --update
```

### 🐛 调试失败的测试
1. **查看具体差异**: 观察测试输出中的STDOUT/STDERR不匹配信息
2. **检查环境变量**: 确认CLI代码正确处理 `MOCK_TIMESTAMP`, `COLUMNS` 等变量
3. **验证文件路径**: 确保所有输入文件使用正确的相对路径
4. **单独执行命令**: 手动运行失败的命令，观察实际输出
5. **重新生成基准**: 必要时使用 `--update` 重新生成基准文件

```bash
# 调试示例：手动执行失败的命令
MOCK_TIMESTAMP="2025-01-01T00:00:00.000Z" COLUMNS="80" \
  bun src/cli/index.ts parse src/cli/__tests__/fixtures/simple.ts --format json

# 重新生成基准
bun scripts/generate-e2e-baseline.ts \
  --command "parse src/cli/__tests__/fixtures/simple.ts --format json" \
  --timestamp "2025-01-01T00:00:00.000Z" \
  --output src/cli/__tests__/e2e/baselines/parse/simple-json \
  --update
```

### 🏆 成功指标
- **测试通过率**: 目标 100% 通过率（当前：38/38 ✅）
- **覆盖完整性**: 覆盖所有CLI命令的核心功能
- **维护效率**: 新功能添加时能快速生成对应测试
- **调试友好**: 测试失败时能快速定位和修复问题

## 经验总结

### ✅ 成功的关键因素
1. **环境变量支持** - 确保确定性输出
2. **占位符系统** - 优雅处理不支持的功能
3. **自动化基准生成** - 减少手工维护成本
4. **跨平台兼容** - 处理编码和路径差异
5. **增量更新机制** - 支持便捷的基准更新

### ⚠️ 常见陷阱和解决方案
1. **时间戳不一致** → 使用 `MOCK_TIMESTAMP` 环境变量
2. **路径依赖错误** → 使用项目相对路径，避免临时路径  
3. **编码问题** → 处理BOM，统一换行符
4. **致命错误中断** → 实现优雅降级，生成占位符
5. **空文件污染** → 定期清理空的输出文件

### 🎯 最佳实践总结
- **测试先行**: 新功能开发前先设计测试场景
- **基准及时更新**: 代码变更后立即更新相关基准
- **环境隔离**: 确保测试环境的一致性和可重复性
- **错误友好**: 提供清晰的错误信息和调试指引
- **持续维护**: 定期检查和清理测试基准文件

通过这套完整的e2e测试框架，我们实现了 **100% 的测试通过率（38/38）**，为CLI工具的稳定性和可维护性提供了坚实保障。

---

## 附录

### A. 常用命令速查

```bash
# 快速生成基准
bun scripts/generate-e2e-baseline.ts --command "COMMAND" --timestamp "2025-01-01T00:00:00.000Z" --output "PATH" 

# 运行特定测试
bun test --test-name-pattern "PATTERN" src/cli/__tests__/e2e/baseline-runner.test.ts

# 清理空文件
Get-ChildItem -Path "src\cli\__tests__\e2e\baselines" -Recurse -Filter "stderr.txt" | Where-Object { $_.Length -eq 0 } | Remove-Item -Force

# 调试命令执行
MOCK_TIMESTAMP="2025-01-01T00:00:00.000Z" COLUMNS="80" bun src/cli/index.ts COMMAND
```

### B. 故障排除清单

- [ ] 环境变量是否正确设置？
- [ ] 文件路径是否使用项目相对路径？ 
- [ ] 输入文件是否存在？
- [ ] 是否需要重新生成AST文件？
- [ ] BOM或编码问题是否已处理？
- [ ] 基准文件是否需要更新？

### C. 项目特定配置

**支持的环境变量**:
- `MOCK_TIMESTAMP`: 在 `src/core/parser.ts` 中使用
- `COLUMNS`: 在 `src/cli/commands/tree.ts` 中使用  
- `DEBUG_UNSUPPORTED`: 在 `src/core/ast-builder/index.ts` 中使用

**占位符生成位置**: `src/core/ast-builder/index.ts` - 处理不支持的TypeScript语法节点
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
