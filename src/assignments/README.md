# 第一阶段作业：单文件AST基础操作闭环

本目录包含了第一阶段的所有作业实现，每个作业都有完整的 skeleton 文件和测试用例。

## 作业结构

```
src/assignments/
├── README.md                    # 本文件
├── run-all.ts                   # 运行所有作业的脚本
├── assignment1.ts               # 作业1测试代码
├── ast-parser.ts               # 作业1实现：AST解析基础
├── assignment2.ts               # 作业2测试代码
├── ast-traverser.ts            # 作业2实现：AST节点遍历
├── assignment3.ts               # 作业3测试代码
├── constraint-extractor.ts     # 作业3实现：约束信息提取
├── assignment4.ts               # 作业4测试代码
├── ai-mock.ts                  # 作业4实现：AI代码生成模拟
├── assignment5.ts               # 作业5测试代码
└── ast-transformer.ts          # 作业5实现：AST节点替换
```

## 运行方式

### 运行单个作业

```bash
# 运行作业1：AST解析基础
bun run src/assignments/ast-parser.ts

# 运行作业2：AST节点遍历与目标定位
bun run src/assignments/ast-traverser.ts

# 运行作业3：约束信息提取
bun run src/assignments/constraint-extractor.ts

# 运行作业4：AI代码生成模拟
bun run src/assignments/ai-mock.ts

# 运行作业5：AST节点替换与新代码生成
bun run src/assignments/ast-transformer.ts
```

### 运行所有作业

```bash
# 运行所有作业
bun run src/assignments/run-all.ts
```

## 作业详情

### 作业1：环境搭建与AST解析基础
- **目标**：学会用 bun + TypeScript Compiler API 解析代码生成AST
- **文件**：`assignment1.ts` + `ast-parser.ts`
- **验收标准**：代码能成功运行，输出包含正确的AST信息，无TypeScript编译错误

### 作业2：AST节点遍历与目标定位
- **目标**：学会遍历AST并精准定位待修改的节点
- **文件**：`assignment2.ts` + `ast-traverser.ts`
- **验收标准**：能准确找到所有if条件节点，输出条件表达式文本，定位结果与预期一致

### 作业3：约束信息提取
- **目标**：从目标节点中提取自由变量（含类型）和节点类型约束
- **文件**：`assignment3.ts` + `constraint-extractor.ts`
- **验收标准**：能提取if条件中的变量，正确识别变量类型，输出约束信息

### 作业4：AI代码生成模拟
- **目标**：基于约束信息，模拟AI生成符合要求的代码片段
- **文件**：`assignment4.ts` + `ai-mock.ts`
- **验收标准**：能根据约束信息生成有效代码，生成的代码符合TypeScript语法，变量类型匹配约束要求

### 作业5：AST节点替换与新代码生成
- **目标**：将AI生成的代码转为AST节点，替换原节点并生成完整代码
- **文件**：`assignment5.ts` + `ast-transformer.ts`
- **验收标准**：成功替换AST节点，生成的代码无语法错误，通过 `bun run` 验证代码可正常运行

## 技术栈

- **运行时**：bun
- **语言**：TypeScript
- **核心库**：typescript (TypeScript Compiler API)
- **类型定义**：@types/node

## 开发环境

确保已安装以下依赖：

```bash
bun add typescript @types/node
```

## 注意事项

1. 所有作业都包含了完整的测试用例和演示代码
2. 每个作业都可以独立运行
3. 代码遵循 TypeScript 最佳实践
4. 所有功能都有详细的注释说明
5. 错误处理机制完善

## 下一步

完成第一阶段后，可以继续学习：
- 第二阶段：文件内符号自动索引与定位
- 第三阶段：项目级跨文件符号支持与自动导入
- 第四阶段：第三方库符号基础支持 