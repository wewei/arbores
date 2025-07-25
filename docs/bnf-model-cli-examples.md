# BNF Model CLI Tool - 使用示例

这是 `scripts/bnf-model.ts` CLI 工具的完整使用指南，包含所有命令的示例。

## 🚀 快速开始

### 1. 查看帮助信息

```powershell
# 查看主命令帮助
bun scripts/bnf-model.ts --help

# 查看子命令帮助
bun scripts/bnf-model.ts validate --help
bun scripts/bnf-model.ts generate --help
bun scripts/bnf-model.ts generate schema --help
bun scripts/bnf-model.ts generate Stringifier --help
```

### 2. 使用 package.json 脚本

```powershell
# 使用预定义的 npm 脚本
npm run bnf-model -- --help
npm run bnf-model:validate -- <file>
npm run bnf-model:generate -- schema <file> -o <dir>
```

## 📝 命令示例

### 验证 BNF 模型

```powershell
# 基本验证 - 输出到控制台
bun scripts/bnf-model.ts validate src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml

# 详细输出
bun scripts/bnf-model.ts validate src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml --verbose

# 保存验证报告到文件
bun scripts/bnf-model.ts validate src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml -o validation-report.txt

# 验证 JSON 格式的模型
bun scripts/bnf-model.ts validate temp/cli-test/invalid-model.json
```

**示例输出：**
```
✅ BNF model validation passed

📋 Model Summary:
  Name: SimpleMath
  Version: 1.0.0
  Start rule: Expression
  Total nodes: 11
  - Token nodes: 6
  - Deduction nodes: 2
  - Union nodes: 3
```

### 生成 TypeScript Schema

```powershell
# 生成完整的 TypeScript 类型定义到目录
bun scripts/bnf-model.ts generate schema src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml -o temp/generated-schema

# 包含文档注释
bun scripts/bnf-model.ts generate schema src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml -o temp/generated-schema --include-docs

# 详细输出
bun scripts/bnf-model.ts generate schema src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml -o temp/generated-schema --verbose
```

**生成的文件结构：**
```
temp/generated-schema/
├── token-types.ts       # Token 接口定义
├── nodes/               # Deduction 节点接口
│   ├── binary-expression.ts
│   └── paren-expression.ts
├── union-types.ts       # Union 类型定义
├── constants.ts         # 常量和注册表
└── index.ts            # 统一导出文件
```

### 生成 Stringifier 函数

```powershell
# 输出到控制台
bun scripts/bnf-model.ts generate Stringifier src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml

# 保存到文件
bun scripts/bnf-model.ts generate Stringifier src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml -o temp/Stringifier-functions.ts

# 自定义函数前缀
bun scripts/bnf-model.ts generate Stringifier src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml --function-prefix "render" -o temp/render-functions.ts

# 自定义缩进风格（Tab）
bun scripts/bnf-model.ts generate Stringifier src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml --indent-style "\\t" -o temp/Stringifier-tabs.ts

# 生成分离的类型定义文件
bun scripts/bnf-model.ts generate Stringifier src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml -o temp/Stringifier.ts --types-file

# 禁用格式化选项
bun scripts/bnf-model.ts generate Stringifier src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml --no-whitespace --no-formatting -o temp/minimal-Stringifier.ts
```

**生成的文件包含：**
- 主要的 Stringifier 函数（如 `StringifierSimpleMath`）
- 每个节点类型的专用函数（如 `StringifierIdentifier`, `StringifierBinaryExpression`）
- 工具函数（缩进、格式化等）
- TypeScript 类型定义

## 🎯 实际工作流程示例

### 完整的 BNF 模型开发流程

```powershell
# 1. 创建工作目录
New-Item -ItemType Directory -Path "my-bnf-project" -Force
cd my-bnf-project

# 2. 创建 BNF 模型文件（YAML 格式）
# 编辑 my-grammar.bnf.yaml...

# 3. 验证模型
bun ../scripts/bnf-model.ts validate my-grammar.bnf.yaml --verbose

# 4. 生成 TypeScript 类型定义
bun ../scripts/bnf-model.ts generate schema my-grammar.bnf.yaml -o generated/types --include-docs

# 5. 生成 Stringifier 函数
bun ../scripts/bnf-model.ts generate Stringifier my-grammar.bnf.yaml -o generated/Stringifier.ts --types-file

# 6. 查看生成的文件
ls generated/
cat generated/Stringifier.ts | head -20
```

### 错误处理示例

```powershell
# 验证无效的模型文件
bun scripts/bnf-model.ts validate temp/cli-test/invalid-model.json
```

**错误输出：**
```
❌ BNF model validation failed

Errors:
  1. Token node "TestToken" string pattern cannot contain whitespace
  2. Start node "NonExistent" is not defined in nodes
```

## 🔧 高级配置

### 自定义配置示例

```powershell
# 使用自定义函数前缀和风格
bun scripts/bnf-model.ts generate Stringifier src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml \\
  --function-prefix "convert" \\
  --indent-style "    " \\
  --no-whitespace \\
  -o temp/custom-Stringifier.ts

# 生成最小化的 schema（无文档）
bun scripts/bnf-model.ts generate schema src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml \\
  -o temp/minimal-schema
```

### 管道操作

```powershell
# 生成代码并查看前几行
bun scripts/bnf-model.ts generate Stringifier src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml | Select-Object -First 20

# 验证多个文件
Get-ChildItem "*.bnf.yaml" | ForEach-Object { 
  Write-Host "Validating $_..."
  bun scripts/bnf-model.ts validate $_.FullName 
}
```

## 📋 支持的文件格式

| 格式 | 扩展名 | 示例 |
|------|--------|------|
| YAML | `.yaml`, `.yml` | `my-grammar.bnf.yaml` |
| JSON | `.json` | `my-grammar.bnf.json` |

## 🎨 输出选项

- **默认行为**: 输出到 stdout/stderr
- **文件输出**: 使用 `-o` 参数指定输出文件或目录
- **彩色输出**: 自动检测终端支持
- **详细模式**: 使用 `--verbose` 获取更多信息

## 🚨 常见问题

### Q: 为什么 schema 生成需要指定输出目录？
A: Schema 生成会创建多个文件的目录结构，无法输出到 stdout。

### Q: 如何自定义生成的代码风格？
A: 使用 `--function-prefix`, `--indent-style`, `--no-whitespace` 等选项。

### Q: 支持哪些 BNF 节点类型？
A: 支持 Token, Deduction, Union 三种基本节点类型。

### Q: 如何集成到 CI/CD 流程？
A: 使用退出代码判断，validate 失败时返回非零退出码。

```powershell
# 在 CI 脚本中
bun scripts/bnf-model.ts validate my-grammar.bnf.yaml
if ($LASTEXITCODE -ne 0) {
  Write-Error "BNF model validation failed"
  exit 1
}
```

## 🎉 完整示例

查看 `src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml` 了解完整的 BNF 模型示例。
