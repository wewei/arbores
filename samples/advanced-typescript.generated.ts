type NonNullable = T extends null | undefined ? never : T;
interface Person {
    name: string;
    age: number;
    address;
}
type PersonName = Person["name"];
type AddressType = Person["address"];
function isString(value: unknown): value is string {
    return typeof value === "string";
}
function isNumber(value: unknown): value is number {
    return typeof value === "number";
}
function getValue(key: string): string;
function getValue(key: number): number;
function getValue(key: string | number): string | number {
    if (typeof key === "string") {
        return `value-${key}`;
    }
    return key * 2;
}
class Container {
    items;
    add(item: T) {
        this.items.push(item);
    }
    findById(id: number) {
        return this.items.find(item => item.id === id);
    }
    getAll() {
        return this.items;
    }
}
class Shape {
    area() { }
    perimeter() { }
    describe() {
        return `This shape has area: ${this.area()}`;
    }
}
class Circle {
    constructor(private radius: number) {
        func();
    }
    area() {
        return Math.PI * this.radius * this.radius;
    }
    perimeter() {
        return 2 * Math.PI * this.radius;
    }
}
enum Color {
    Red = "red",
    Green = "green",
    Blue = "blue"
}
const enum Direction {
    Up = 1,
    Down,
    Left,
    Right
}
namespace Geometry {
    interface Point {
        x: number;
        y: number;
    }
    function distance(p1: Point, p2: Point): number {
        return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }
}
const point1: Geometry.Point = { x: 0, y: 0 };
const point2: Geometry.Point = { x: 3, y: 4 };
const dist = Geometry.distance(point1, point2);

