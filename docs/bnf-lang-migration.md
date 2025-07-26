# BNF-Lang to BNF-Model Migration Guide

`bnf-lang` 命令已被移除，其所有功能已整合到更强大的 `bnf-model` 命令中。

## 命令迁移对照表

### 旧的 bnf-lang 命令

```bash
# 生成 schema
bun bnf-lang schema model.bnf.yaml typescript

# 生成 stringifier
bun bnf-lang stringifier model.bnf.yaml typescript

# 生成 parser
bun bnf-lang parser model.bnf.yaml typescript

# 生成所有内容
bun bnf-lang generate model.bnf.yaml typescript
```

### 新的 bnf-model 命令

```bash
# 生成 schema
bun bnf-model generate model.bnf.yaml schema -o src/core/languages/typescript

# 生成 stringifier
bun bnf-model generate model.bnf.yaml stringifier -o src/core/languages/typescript

# 生成 parser
bun bnf-model generate model.bnf.yaml parser -o src/core/languages/typescript

# 生成所有内容
bun bnf-model generate model.bnf.yaml schema stringifier parser -o src/core/languages/typescript
```

## 新的输出文件夹结构

`bnf-model` 现在使用统一的文件夹结构：

```
<output-dir>/
├── grammar.bnf.yaml     # BNF model file (复制自源文件)
├── schema/              # TypeScript 类型定义
│   ├── nodes/           # 每个 deduction node 的类型声明
│   │   ├── <node-name-a>.ts
│   │   └── <node-name-b>.ts
│   ├── constants.ts     # 所有 token 模式和常量
│   ├── token-types.ts   # 所有 token 类型声明
│   ├── union-types.ts   # 所有 union 类型声明
│   └── index.ts
├── stringifier/         # 字符串化函数
│   ├── <node-name-a>.ts # 节点 a 的字符串化函数
│   ├── <node-name-b>.ts # 节点 b 的字符串化函数
│   └── index.ts
└── parser/              # PEG.js 解析器
    ├── <language>.syntax.pegjs # PEG.js 语法文件
    └── index.ts               # 主解析器入口点
```

## 主要改进

1. **标准化的文件夹结构**：所有生成的代码按类型组织到子文件夹中
2. **更灵活的输出目录**：可以指定任何输出目录，不限于 `src/core/languages/<language>`
3. **多目标支持**：可以一次生成多个目标，如 `schema stringifier parser`
4. **统一的工具链**：验证、生成等功能统一在 `bnf-model` 命令下
5. **更好的错误处理**：改进的错误报告和验证
6. **自动文件复制**：BNF 模型文件自动复制到输出目录
7. **更多选项**：支持 `--clean`, `--dry-run`, `--verbose` 等选项

## 新增功能

### 验证功能
```bash
# 验证 BNF 模型文件
bun bnf-model validate model.bnf.yaml
```

### 高级选项
```bash
# 清理输出目录并生成（保护 BNF 模型文件）
bun bnf-model generate model.bnf.yaml schema stringifier parser -o output/ --clean

# 演练模式（不实际创建文件）
bun bnf-model generate model.bnf.yaml schema --dry-run

# 详细输出
bun bnf-model generate model.bnf.yaml schema --verbose
```

## 依赖关系处理

`bnf-model` 会自动处理依赖关系：
- 如果生成 `stringifier` 或 `parser`，会自动包含 `schema`
- 不需要手动管理生成顺序

## 快速替换

如果您在脚本中使用了 `bnf-lang`，可以使用以下模式快速替换：

```bash
# 将
bun bnf-lang generate model.bnf.yaml <language>

# 替换为
bun bnf-model generate model.bnf.yaml schema stringifier parser -o src/core/languages/<language>
```

## 获取帮助

```bash
# 查看所有命令
bun bnf-model --help

# 查看生成命令的选项
bun bnf-model generate --help

# 查看验证命令的选项
bun bnf-model validate --help
```
