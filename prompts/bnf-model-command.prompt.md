调整一下 bnf-model script 的 generate 命令格式。

### 命令格式：
```
bnf-model generate [options] <bnf-model-file> <target>...
```

### Targets:
* schema: 生成 BNF 语法的 schema 文件。
* stringifier: 生成 BNF 语法的字符串化器。
* parser: 生成 BNF 语法的解析器。

stringifier 和 parser 都依赖 schema。

### Options:
* -o/--output: 指定输出目录，默认为 bnf-model-file 文件所在目录。
* -t/--types: 指定一来的 BNFModel 基础类型所在在文件，默认为 src/core/bnf-model/types.ts
* -c/--clean: 在生成之前清理输出目录 (保留 bnf-model-file 文件)。
* --verbose: 输出详细的生成过程信息。
* --dry-run: 模拟生成过程，不实际创建文件。
* --help: 显示帮助信息。
