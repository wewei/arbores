// Test file for type annotations
function addNumbers(a: number, b: number): number {
  return a + b;
}

function greetUser(name: string): string {
  return `Hello, ${name}!`;
}

function isValid(flag: boolean): boolean {
  return !flag;
}

function processData(data: any): void {
  console.log(data);
}

interface User {
  id: number;
  name: string;
  isActive: boolean;
}

class Calculator {
  private value: number = 0;
  
  add(num: number): number {
    return this.value + num;
  }
  
  getValue(): number {
    return this.value;
  }
}
