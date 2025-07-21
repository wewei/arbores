// Various export statement types for testing
export const namedExport = 42;
export let variableExport = "test";
export var legacyVarExport = true;

export function functionExport() {
  return "exported function";
}

export class ClassExport {
  constructor(public value: number) {}
}

export interface InterfaceExport {
  prop: string;
}

export enum EnumExport {
  First = "first",
  Second = "second"
}

export type TypeExport = string | number;

// Named exports
const localValue = "local";
const anotherValue = 123;
export { namedExport as renamedExport, localValue, anotherValue };

// Re-exports (commented out to avoid module resolution errors)
// export { something } from './other-module';
// export { default as imported } from './another-module';
// export * from './all-exports';
// export * as namespace from './namespace-exports';

// Default export
const defaultValue = "default export value";
export default defaultValue;
