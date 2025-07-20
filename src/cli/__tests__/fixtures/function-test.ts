// Function-focused TypeScript code for stringify testing
function hello(name: string): string {
  return `Hello, ${name}!`;
}

const greeting = hello("world");
console.log(greeting);

export { hello };
