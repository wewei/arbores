/**
 * 作业1测试代码：环境搭建与AST解析基础
 * 用于测试AST解析功能的基础代码
 */

export function validateAge(age: number): string {
  if (age >= 18) {
    return "成年人";
  } else {
    return "未成年人";
  }
}

// 导出测试数据
export const testData = {
  validAge: 20,
  invalidAge: 15,
  boundaryAge: 18
}; 