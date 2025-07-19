// Advanced TypeScript features test file
import { readFile } from 'fs/promises';

// Generic interface
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(value: T): void;
}

// Union types and optional properties
type Status = 'pending' | 'completed' | 'failed';

interface Task {
  id: number;
  title: string;
  status: Status;
  priority?: number;
}

// Generic class with constraints
class DataProcessor<T extends { id: number }> {
  private items: T[] = [];
  
  add(item: T): void {
    this.items.push(item);
  }
  
  findById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }
  
  process(): Promise<T[]> {
    return Promise.resolve(this.items);
  }
}

// Arrow functions with different syntax
const simpleArrow = () => console.log('simple');
const withParam = (x: number) => x * 2;
const withBlock = (data: Task[]) => {
  return data.filter(task => task.status === 'completed');
};

// Destructuring assignment
const task: Task = { id: 1, title: 'Test', status: 'pending' };
const { id, title, status } = task;

// Spread operator
const numbers = [1, 2, 3];
const moreNumbers = [...numbers, 4, 5];

// Template literals with expressions
const message = `Task ${id}: ${title} is ${status}`;

// Try-catch block
async function processFile(path: string): Promise<string | null> {
  try {
    const content = await readFile(path, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Failed to read file: ${error}`);
    return null;
  }
}

// Conditional (ternary) operator
const isHighPriority = (task: Task) => task.priority ? task.priority > 5 : false;
