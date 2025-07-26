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

## 主要改进

1. **更灵活的输出目录**：可以指定任何输出目录，不限于 `src/core/languages/<language>`
2. **多目标支持**：可以一次生成多个目标，如 `schema stringifier parser`
3. **统一的工具链**：验证、生成等功能统一在 `bnf-model` 命令下
4. **更好的错误处理**：改进的错误报告和验证
5. **更多选项**：支持 `--clean`, `--dry-run`, `--verbose` 等选项

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
