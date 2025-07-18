// 基础表达式示例 - 用于测试 ast-builder 系统

// 声明一些变量用于后续表达式
const a = 10;
const b = 20;
const x = 5;
const y = 3;

// 二元表达式
const sum = 1 + 2;
const product = a * b;
const comparison = x > y;

// 模拟对象用于属性访问
const config = {
    database: {
        host: 'localhost'
    }
};

// 属性访问表达式
const deepAccess = config.database.host;

// 模拟函数用于调用表达式
function calculate(x: number, y: number): number {
    return x + y;
}

const api = {
    getData: () => Promise.resolve({ data: 'test' })
};

// 调用表达式
const result = calculate(10, 20);
const chainedCall = api.getData().then(data => data);

// 异步表达式
async function fetchUser() {
    const response = await fetch('/api/user');
    return await response.json();
}

// 类声明
class Calculator {
    private value: number = 0;
    
    add(x: number): number {
        return this.value + x;
    }
    
    getValue(): number {
        return this.value;
    }
}

// 接口声明
interface User {
    id: number;
    name: string;
    email?: string;
}

// 对象字面量
const user: User = {
    id: 1,
    name: "John",
    email: "john@example.com"
};

// 属性访问表达式
const userName = user.name;

// 数组字面量
const numbers = [1, 2, 3, 4, 5];
const users = [user, { id: 2, name: "Jane" }];
