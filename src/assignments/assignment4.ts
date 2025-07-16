/**
 * 作业4测试代码：AI代码生成模拟
 * 提供约束信息和修改需求的测试数据
 */

// 约束信息类型定义
export type ConstraintInfo = {
  variables: Record<string, string>; // 变量名 -> 类型
  nodeType: string; // 节点类型约束
  originalCode: string; // 原代码片段
};

// 测试约束信息
export const testConstraints: ConstraintInfo[] = [
  {
    variables: { price: "number", isVip: "boolean" },
    nodeType: "BinaryExpression",
    originalCode: "price > 100 && isVip"
  },
  {
    variables: { age: "number" },
    nodeType: "BinaryExpression", 
    originalCode: "age < 25"
  },
  {
    variables: { user: "User", isAdmin: "boolean" },
    nodeType: "BinaryExpression",
    originalCode: "user.age >= 18"
  }
];

// 测试修改需求
export const testModifications = [
  "添加年龄大于等于18的条件",
  "增加VIP用户且消费金额大于200的条件",
  "添加用户名为非空的条件"
]; 