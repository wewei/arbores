/**
 * 作业4：AI代码生成模拟
 * 基于约束信息，模拟AI生成符合要求的代码片段
 */

import type { ConstraintInfo } from './assignment4';
import { testConstraints, testModifications } from './assignment4';

/**
 * 验证生成的代码是否符合约束
 * @param code 生成的代码
 * @param constraint 约束信息
 * @returns 验证结果
 */
export function validateGeneratedCode(code: string, constraint: ConstraintInfo): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // 检查是否包含所有必需变量
  for (const [varName, varType] of Object.entries(constraint.variables)) {
    if (!code.includes(varName)) {
      errors.push(`缺少变量: ${varName}`);
    }
  }
  
  // 检查代码语法（简单检查）
  if (!code.includes('&&') && !code.includes('||') && !code.includes('>') && !code.includes('<') && !code.includes('===')) {
    errors.push('代码可能不是有效的条件表达式');
  }
  
  // 检查是否包含原始代码（可选）
  const firstWord = constraint.originalCode.split(' ')[0];
  if (firstWord && !code.includes(firstWord)) {
    errors.push('生成的代码可能没有基于原始代码');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 模拟AI生成代码
 * @param constraint 约束信息
 * @param modification 修改需求
 * @returns 生成的代码片段
 */
export function mockAI(constraint: ConstraintInfo, modification: string): string {
  // 简单的规则引擎来模拟AI生成
  const { variables, originalCode } = constraint;
  
  // 根据修改需求生成不同的代码
  if (modification.includes('年龄') && variables.age) {
    if (modification.includes('大于等于18')) {
      return `${originalCode} && age >= 18`;
    } else if (modification.includes('小于25')) {
      return `${originalCode} && age < 25`;
    }
  }
  
  if (modification.includes('VIP') && variables.isVip) {
    if (modification.includes('200')) {
      return `${originalCode} && isVip && price > 200`;
    } else {
      return `${originalCode} && isVip`;
    }
  }
  
  if (modification.includes('用户名') && variables.user) {
    return `${originalCode} && user.name.length > 0`;
  }
  
  // 默认情况：添加一个简单的条件
  const firstVar = Object.keys(variables)[0];
  if (firstVar) {
    return `${originalCode} && ${firstVar} !== null`;
  }
  
  return originalCode;
}

/**
 * 生成提示词模板
 * @param constraint 约束信息
 * @param modification 修改需求
 * @returns 格式化的提示词
 */
export function generatePrompt(constraint: ConstraintInfo, modification: string): string {
  const variablesList = Object.entries(constraint.variables)
    .map(([name, type]) => `${name}: ${type}`)
    .join(', ');
  
  return `
请根据以下约束信息生成代码：

可用变量: ${variablesList}
节点类型: ${constraint.nodeType}
原始代码: ${constraint.originalCode}
修改需求: ${modification}

要求：
1. 生成的代码必须符合TypeScript语法
2. 只能使用提供的变量
3. 返回类型必须与节点类型约束匹配
4. 代码应该基于原始代码进行扩展

请生成符合要求的代码片段：
  `.trim();
}

/**
 * 主函数：演示AI代码生成模拟功能
 */
export function main(): void {
  console.log('=== 作业4：AI代码生成模拟 ===\n');
  
  testConstraints.forEach((constraint, index) => {
    const modification = testModifications[index] || "添加额外条件";
    
    console.log(`测试用例 ${index + 1}:`);
    console.log(`  约束信息: ${JSON.stringify(constraint, null, 2)}`);
    console.log(`  修改需求: ${modification}`);
    
    // 生成提示词
    const prompt = generatePrompt(constraint, modification);
    console.log(`  提示词模板:\n${prompt}`);
    
    // 模拟AI生成
    const generatedCode = mockAI(constraint, modification);
    console.log(`  生成的代码: "${generatedCode}"`);
    
    // 验证生成的代码
    const validation = validateGeneratedCode(generatedCode, constraint);
    console.log(`  验证结果: ${validation.isValid ? '通过' : '失败'}`);
    
    if (!validation.isValid) {
      console.log(`  错误信息: ${validation.errors.join(', ')}`);
    }
    
    console.log('');
  });
}

// 如果直接运行此文件，执行主函数
if (require.main === module) {
  main();
} 