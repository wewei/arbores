// 测试可选链语法的各种形式
export function testOptionalChaining() {
  const obj: any = {
    nested: {
      method: () => 'hello',
      prop: 42
    }
  };

  // 可选属性访问
  const prop1 = obj.nested?.prop;
  const prop2 = obj.missing?.prop;

  // 可选方法调用
  const result1 = obj.nested?.method();
  const result2 = obj.missing?.method?.();

  // 可选元素访问
  const arr: number[] | undefined = [1, 2, 3];
  const element = arr?.[0];

  return {
    prop1,
    prop2,
    result1,
    result2,
    element
  };
}
