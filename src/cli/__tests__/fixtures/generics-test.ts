// Generic types and utility types
export interface GenericContainer<T> {
  value: T;
  metadata?: Record<string, unknown>;
}

export type Optional<T> = {
  [K in keyof T]?: T[K];
};

export type Required<T> = {
  [K in keyof T]-?: T[K];
};

export function identity<T>(arg: T): T {
  return arg;
}

export class Container<T extends string | number> {
  private _value: T;

  constructor(value: T) {
    this._value = value;
  }

  getValue(): T {
    return this._value;
  }

  static create<U extends string | number>(value: U): Container<U> {
    return new Container(value);
  }
}

// Type predicates and conditional types
export function isString<T>(value: T | string): value is string {
  return typeof value === 'string';
}

export type StringOrNumber<T> = T extends string ? string : number;
