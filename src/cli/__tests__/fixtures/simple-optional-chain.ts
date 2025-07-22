// 测试简单的可选链语法
export function testBasicOptionalChaining() {
  const obj: any = {
    prop: 42,
    method: () => 'hello'
  };

  // 可选属性访问
  const prop1 = obj?.prop;
  const prop2 = obj.missing?.prop;

  // 可选方法调用
  const result1 = obj?.method();
  const result2 = obj.missing?.method();

  return { prop1, prop2, result1, result2 };
}
