/**
 * 作业5测试代码：AST节点替换与新代码生成
 * 提供用于测试节点替换的原始代码
 */

export function calculateDiscount(price: number, isVip: boolean, age: number): number {
  let discount = 0;
  if (price > 100 && isVip) {
    discount = 0.2;
  } else if (age < 25) {
    discount = 0.1;
  }
  return price * (1 - discount);
}

// 测试数据
export const testCases = [
  { price: 150, isVip: true, age: 30 },
  { price: 80, isVip: false, age: 20 },
  { price: 200, isVip: false, age: 35 }
];

// 预期的修改结果
export const expectedModifications = [
  "price > 100 && isVip && age >= 18",
  "age < 25 && price > 50",
  "price > 100 && isVip && age >= 18"
]; 