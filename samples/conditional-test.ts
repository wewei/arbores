// Test conditional types only
type NonNullable<T> = T extends null | undefined ? never : T;
