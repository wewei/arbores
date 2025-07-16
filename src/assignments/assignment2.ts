/**
 * 作业2测试代码：AST节点遍历与目标定位
 * 包含多个if语句的复杂测试代码
 */

export function processUser(user: { age: number; name: string }): string {
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

// 导出测试数据
export const testUsers = [
  { age: 20, name: "张三" },
  { age: 16, name: "李四" },
  { age: 25, name: "" },
  { age: 18, name: "王五" }
]; 