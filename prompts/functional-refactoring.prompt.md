# Functional Refactoring Prompt

Given a class, we refactor it into a set of types and functions.

Firstly, the class itself should be mapped into a type definition to cover all its properties.
For each method in the class, we create a function that takes the type as its first argument, followed by any additional parameters that the method requires.

For the mutable methods, we return a new instance of the type with the updated properties, rather than modifying the original instance. If the method already has a return type, we return a product type of both the original return type and the class mapped type.

## Example 1: Basic Transformation

### Before (Class-based)
```typescript
class Counter {
  private value: number;
  
  constructor(initialValue: number = 0) {
    this.value = initialValue;
  }
  
  getValue(): number {
    return this.value;
  }
  
  increment(): void {
    this.value++;
  }
  
  add(amount: number): void {
    this.value += amount;
  }
}
```

### After (Functional)
```typescript
// Type definition covering all properties
interface Counter {
  readonly value: number;
}

// Constructor function
const createCounter = (initialValue: number = 0): Counter => ({
  value: initialValue
});

// Pure functions for each method
const getValue = (counter: Counter): number => counter.value;

const increment = (counter: Counter): Counter => ({
  ...counter,
  value: counter.value + 1
});

const add = (counter: Counter, amount: number): Counter => ({
  ...counter,
  value: counter.value + amount
});
```

## Example 2: Methods with Return Values

### Before (Class-based)
```typescript
class BankAccount {
  private balance: number;
  
  constructor(initialBalance: number = 0) {
    this.balance = initialBalance;
  }
  
  deposit(amount: number): boolean {
    if (amount > 0) {
      this.balance += amount;
      return true;
    }
    return false;
  }
  
  withdraw(amount: number): boolean {
    if (amount > 0 && amount <= this.balance) {
      this.balance -= amount;
      return true;
    }
    return false;
  }
}
```

### After (Functional)
```typescript
// Type definition
interface BankAccount {
  readonly balance: number;
}

// Constructor function
const createBankAccount = (initialBalance: number = 0): BankAccount => ({
  balance: initialBalance
});

// Pure functions - methods with return values use product types
const deposit = (account: BankAccount, amount: number): { success: boolean; account: BankAccount } => {
  if (amount > 0) {
    return {
      success: true,
      account: { ...account, balance: account.balance + amount }
    };
  }
  return { success: false, account };
};

const withdraw = (account: BankAccount, amount: number): { success: boolean; account: BankAccount } => {
  if (amount > 0 && amount <= account.balance) {
    return {
      success: true,
      account: { ...account, balance: account.balance - amount }
    };
  }
  return { success: false, account };
};
```

## Key Principles

1. **Immutability**: All data structures are immutable, using `readonly` modifiers and spread operators
2. **Pure Functions**: Functions have no side effects and always return the same output for the same input
3. **Product Types**: When methods have return values, combine them with the updated state
4. **Explicit State**: State changes are explicit through function parameters and return values

