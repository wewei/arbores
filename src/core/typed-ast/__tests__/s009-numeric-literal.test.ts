/**
 * NumericLiteral 类型单元测试
 */
import { expect, test, describe } from 'bun:test';
import type { NumericLiteralNode } from '../types/s009-numeric-literal';
import { isNumericLiteral } from '../types/s009-numeric-literal';

describe('NumericLiteral', () => {
  test('should create NumericLiteralNode with decimal number', () => {
    const node: NumericLiteralNode = {
      id: 'num-1',
      kind: 9,
      text: '42',
      value: 42,
      base: 10,
    };

    expect(node.kind).toBe(9);
    expect(node.text).toBe('42');
    expect(node.value).toBe(42);
    expect(node.base).toBe(10);
  });

  test('should create NumericLiteralNode with hexadecimal number', () => {
    const node: NumericLiteralNode = {
      id: 'num-hex',
      kind: 9,
      text: '0xFF',
      value: 255,
      base: 16,
    };

    expect(node.text).toBe('0xFF');
    expect(node.value).toBe(255);
    expect(node.base).toBe(16);
  });

  test('should create NumericLiteralNode with binary number', () => {
    const node: NumericLiteralNode = {
      id: 'num-bin',
      kind: 9,
      text: '0b1010',
      value: 10,
      base: 2,
    };

    expect(node.text).toBe('0b1010');
    expect(node.value).toBe(10);
    expect(node.base).toBe(2);
  });

  test('should create NumericLiteralNode with octal number', () => {
    const node: NumericLiteralNode = {
      id: 'num-oct',
      kind: 9,
      text: '0o755',
      value: 493,
      base: 8,
    };

    expect(node.text).toBe('0o755');
    expect(node.value).toBe(493);
    expect(node.base).toBe(8);
  });

  test('should handle floating point numbers', () => {
    const node: NumericLiteralNode = {
      id: 'num-float',
      kind: 9,
      text: '3.14159',
      value: 3.14159,
      base: 10,
    };

    expect(node.text).toBe('3.14159');
    expect(node.value).toBe(3.14159);
    expect(node.base).toBe(10);
  });

  test('should handle scientific notation', () => {
    const node: NumericLiteralNode = {
      id: 'num-sci',
      kind: 9,
      text: '1.23e-4',
      value: 0.000123,
      base: 10,
    };

    expect(node.text).toBe('1.23e-4');
    expect(node.value).toBe(0.000123);
    expect(node.base).toBe(10);
  });

  test('should identify NumericLiteral nodes correctly', () => {
    const numericNode: NumericLiteralNode = {
      id: 'num-1',
      kind: 9,
      text: '42',
      value: 42,
      base: 10,
    };

    const otherNode = {
      id: 'other-1',
      kind: 11,
      text: '"string"',
    };

    expect(isNumericLiteral(numericNode)).toBe(true);
    expect(isNumericLiteral(otherNode as any)).toBe(false);
  });
});
