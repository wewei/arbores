# StringifierGenerator 函数式重构对比

## 重构概览

将原来的 `StringifierGenerator` 类重构为函数式版本，应用了函数式重构 prompt 中的原则。

## 主要变化

### 1. 类 → 类型 + 函数

**Before (Class-based):**
```typescript
export class StringifierGenerator {
  private model: BNFModel;
  private config: StringifierConfig;
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(model: BNFModel, config: StringifierConfig = {}) {
    this.model = model;
    this.config = { /* defaults */ };
  }

  public generate(): StringifierGenerationResult {
    // implementation
  }

  private reset(): void {
    this.warnings.length = 0;
    this.errors.length = 0;
  }
}
```

**After (Functional):**
```typescript
// Type definition covering all properties
export interface StringifierGeneratorState {
  readonly model: BNFModel;
  readonly config: StringifierConfig;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

// Constructor function
export const createStringifierGenerator = (
  model: BNFModel,
  config: StringifierConfig = {}
): StringifierGeneratorState => ({
  model,
  config: { /* defaults */ },
  warnings: [],
  errors: []
});

// Pure functions for each method
export const generate = (state: StringifierGeneratorState): StringifierGenerationResult => {
  // implementation
};

const reset = (state: StringifierGeneratorState): StringifierGeneratorState => ({
  ...state,
  warnings: [],
  errors: []
});
```

### 2. 可变方法返回新状态

**Before:**
```typescript
private reset(): void {
  this.warnings.length = 0;
  this.errors.length = 0;
}
```

**After:**
```typescript
const reset = (state: StringifierGeneratorState): StringifierGeneratorState => ({
  ...state,
  warnings: [],
  errors: []
});
```

### 3. 带返回值的方法使用产品类型

**Before:**
```typescript
private validateModel(): string[] {
  // returns errors only
}
```

**After:**
```typescript
const validateModel = (state: StringifierGeneratorState): {
  success: boolean;
  errors?: string[];
  state: StringifierGeneratorState;
} => {
  // returns both validation result and updated state
};
```

## 核心原则应用

### ✅ 不可变性
- 所有状态使用 `readonly` 修饰符
- 使用扩展运算符创建新对象而不是修改原对象
- 数组操作返回新数组

### ✅ 纯函数
- 所有函数都没有副作用
- 相同输入总是产生相同输出
- 状态通过参数传递，通过返回值更新

### ✅ 产品类型
- 需要返回验证结果和状态的函数使用 `{ success, errors?, state }` 结构
- 保持原有返回值的同时携带更新后的状态

### ✅ 显式状态
- 状态变化通过函数参数和返回值明确表达
- 没有隐藏的内部状态修改

## 使用方式对比

**Before (Class-based):**
```typescript
const generator = new StringifierGenerator(model, config);
const result = generator.generate();
```

**After (Functional):**
```typescript
const state = createStringifierGenerator(model, config);
const result = generate(state);

// Or using the convenience function (maintains API compatibility)
const result = generateStringifierFunctions(model, config);
```

## 优势

1. **可测试性**: 每个函数可以独立测试，不需要复杂的类实例化
2. **可组合性**: 函数可以轻松组合和链式调用
3. **可预测性**: 纯函数的行为完全可预测
4. **并发安全**: 不可变数据结构天然线程安全
5. **时间旅行**: 容易实现撤销/重做功能
6. **调试友好**: 状态变化明确且可追踪

## 向后兼容

保留了 `generateStringifierFunctions` 便利函数，确保现有代码无需修改即可使用。
