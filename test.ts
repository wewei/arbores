function add(a: number, b: number): number {
  return a + b;
}

async function fetchData(url: string): Promise<any> {
  const response = await fetch(url);
  return response.json();
}

class Calculator {
  private value: number = 0;
  
  add(x: number): number {
    this.value += x;
    return this.value;
  }
  
  getValue(): number {
    return this.value;
  }
}

interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
}; 