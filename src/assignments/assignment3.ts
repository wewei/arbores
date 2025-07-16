/**
 * 作业3测试代码：约束信息提取
 * 包含复杂条件表达式的测试代码
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

// 导出测试数据
export const testCases = [
  { price: 150, isVip: true, age: 30 },
  { price: 80, isVip: false, age: 20 },
  { price: 200, isVip: false, age: 35 },
  { price: 120, isVip: true, age: 18 }
]; 