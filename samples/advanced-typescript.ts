// 基础高级 TypeScript 特性测试文件

// 条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

// 索引访问类型
interface Person {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
  };
}

type PersonName = Person['name'];
type AddressType = Person['address'];

// 类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

// 重载签名
function getValue(key: string): string;
function getValue(key: number): number;
function getValue(key: string | number): string | number {
  if (typeof key === 'string') {
    return `value-${key}`;
  }
  return key * 2;
}

// 泛型类与约束
class Container<T extends { id: number }> {
  private items: T[] = [];
  
  add(item: T): void {
    this.items.push(item);
  }
  
  findById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }
  
  getAll(): readonly T[] {
    return this.items;
  }
}

// 抽象类和抽象方法
abstract class Shape {
  abstract area(): number;
  
  perimeter?(): number; // 可选方法
  
  describe(): string {
    return `This shape has area: ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }
  
  area(): number {
    return Math.PI * this.radius * this.radius;
  }
  
  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

// 枚举类型
enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

const enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

// 命名空间
namespace Geometry {
  export interface Point {
    x: number;
    y: number;
  }
  
  export function distance(p1: Point, p2: Point): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }
}

// 使用命名空间
const point1: Geometry.Point = { x: 0, y: 0 };
const point2: Geometry.Point = { x: 3, y: 4 };
const dist = Geometry.distance(point1, point2);
