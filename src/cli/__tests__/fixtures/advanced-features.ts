// Advanced JavaScript/TypeScript features
export async function* asyncGenerator(): AsyncIterableIterator<number> {
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    yield i;
  }
}

export const asyncArrowFunction = async (data: unknown[]): Promise<string[]> => {
  return data.map(item => String(item));
};

// Destructuring and spread operators
export function processData({
  name,
  age,
  ...rest
}: {
  name: string;
  age: number;
  [key: string]: unknown;
}) {
  return { name, age, metadata: rest };
}

export const [first, second, ...remaining] = [1, 2, 3, 4, 5];

// Template literal types and advanced patterns
export type EventName = `on${Capitalize<string>}`;
export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

export class EventEmitter<T extends Record<string, unknown[]>> {
  private listeners: Partial<{ [K in keyof T]: Array<(...args: T[K]) => void> }> = {};

  on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    this.listeners[event]?.forEach(listener => listener(...args));
  }
}
