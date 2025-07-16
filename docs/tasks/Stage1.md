# 第一阶段：单文件AST基础操作闭环

## 核心目标
实现"手动指定修改节点→提取约束信息→AI生成代码片段→结构化替换"的全流程，验证基础逻辑可行性。

## 关键成果
- 能解析单个TypeScript文件生成AST，并手动定位目标节点（如if条件表达式、变量赋值语句）
- 自动提取节点的约束信息（可用变量及类型、节点类型要求）
- 用AST工具链完成节点替换，生成无语法错误的新代码

## 演示场景
修改函数内的条件判断逻辑（如将"a>10"改为"a>10且b为偶数"），替换后代码通过TypeScript类型检查。

---

## 作业题（基于 bun + TypeScript）

### 作业1：环境搭建与AST解析基础
**目标**：学会用 bun + TypeScript Compiler API 解析代码生成AST，理解AST基本结构。

**前置准备**：
```bash
# 确保已安装 bun
curl -fsSL https://bun.sh/install | bash

# 初始化项目
bun init -y
bun add typescript @types/node
```

**作业内容**：
1. 创建 `src/assignments/assignment1.ts`，编写以下测试代码：
```typescript
function validateAge(age: number): string {
  if (age >= 18) {
    return "成年人";
  } else {
    return "未成年人";
  }
}
```

2. 创建 `src/assignments/ast-parser.ts`，实现以下功能：
   - 使用 `ts.createSourceFile` 解析上述代码
   - 打印AST基本信息：文件名、节点数量、是否有语法错误
   - 验证解析成功，无报错

**验收标准**：
- 代码能成功运行：`bun run src/assignments/ast-parser.ts`
- 输出包含正确的AST信息
- 无TypeScript编译错误

---

### 作业2：AST节点遍历与目标定位
**目标**：学会遍历AST并精准定位待修改的节点（如if条件表达式）。

**作业内容**：
1. 在 `src/assignments/assignment2.ts` 中，基于作业1的代码，实现以下功能：
   - 编写 `findIfConditions` 函数，递归查找所有if语句的条件表达式节点
   - 使用 `ts.forEachChild` 遍历AST节点
   - 通过 `ts.SyntaxKind` 判断节点类型
   - 用 `ts.getText(sourceFile, node)` 打印节点对应的代码文本

2. 扩展测试代码，包含多个if语句：
```typescript
function processUser(user: { age: number; name: string }): string {
  if (user.age >= 18) {
    if (user.name.length > 0) {
      return "有效用户";
    } else {
      return "无效用户";
    }
  } else {
    return "未成年用户";
  }
}
```

**验收标准**：
- 能准确找到所有if条件节点
- 输出条件表达式文本（如 "user.age >= 18"）
- 定位结果与预期一致

---

### 作业3：约束信息提取
**目标**：从目标节点中提取自由变量（含类型）和节点类型约束。

**作业内容**：
1. 在 `src/assignments/assignment3.ts` 中，实现以下功能：
   - 使用 `ts.createProgram` 替代 `ts.createSourceFile`，创建包含类型检查能力的程序
   - 编写 `extractFreeVariables` 函数：遍历目标节点，收集所有变量
   - 通过 `TypeChecker` 获取变量类型信息
   - 明确节点类型约束（如"if条件必须是布尔表达式"）

2. 测试代码：
```typescript
function calculateDiscount(price: number, isVip: boolean, age: number): number {
  let discount = 0;
  if (price > 100 && isVip) {
    discount = 0.2;
  } else if (age < 25) {
    discount = 0.1;
  }
  return price * (1 - discount);
}
```

**验收标准**：
- 能提取if条件中的变量（如 price, isVip, age）
- 正确识别变量类型（number, boolean）
- 输出约束信息（如"条件表达式必须返回boolean"）

---

### 作业4：AI代码生成模拟
**目标**：基于约束信息，模拟AI生成符合要求的代码片段。

**作业内容**：
1. 在 `src/assignments/assignment4.ts` 中，实现以下功能：
   - 设计提示词模板：包含约束信息（可用变量、节点类型）和原代码片段
   - 编写 `mockAI` 函数，返回符合约束的代码
   - 验证生成结果：确保代码片段符合变量类型和节点类型要求

2. 实现示例：
```typescript
type ConstraintInfo = {
  variables: Record<string, string>; // 变量名 -> 类型
  nodeType: string; // 节点类型约束
  originalCode: string; // 原代码片段
};

function mockAI(constraint: ConstraintInfo, modification: string): string {
  // 模拟AI生成逻辑
  // 返回符合约束的新代码片段
}
```

**验收标准**：
- 能根据约束信息生成有效代码
- 生成的代码符合TypeScript语法
- 变量类型匹配约束要求

---

### 作业5：AST节点替换与新代码生成
**目标**：将AI生成的代码转为AST节点，替换原节点并生成完整代码。

**作业内容**：
1. 在 `src/assignments/assignment5.ts` 中，实现以下功能：
   - 解析AI生成的代码片段为AST节点
   - 使用 `ts.factory` 安全创建/修改AST节点
   - 用 `ts.factory.updateIfStatement` 替换原if语句的条件表达式节点
   - 用 `ts.createPrinter` 将修改后的AST打印为完整代码

2. 测试场景：
   - 原条件：`price > 100 && isVip`
   - AI生成：`price > 100 && isVip && age >= 18`
   - 验证替换后的代码能正常编译运行

**验收标准**：
- 成功替换AST节点
- 生成的代码无语法错误
- 通过 `bun run` 验证代码可正常运行
- 函数逻辑符合预期

---

## 验收标准
1. 能成功解析代码生成AST，并定位到目标节点（如if条件）
2. 提取的自由变量及类型准确（如`{ a: "number", b: "number" }`）
3. AI生成的代码片段符合约束，替换后无语法错误
4. 最终生成的代码可正常运行（如函数逻辑符合预期）

## 提交要求
- 每个作业创建独立的文件
- 包含完整的测试代码和实现
- 通过 `bun run` 验证所有功能正常
- 代码风格符合TypeScript最佳实践

通过以上作业，既能逐步掌握TypeScript Compiler API的核心用法，又能验证"结构化编程"的基础逻辑，为后续阶段奠定基础。 