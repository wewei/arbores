/**
 * StringLiteral 类型单元测试
 */
import { expect, test, describe } from 'bun:test';
import type { StringLiteralNode } from '../types/s011-string-literal';
import { isStringLiteral } from '../types/s011-string-literal';

describe('StringLiteral', () => {
  test('should create StringLiteralNode with single quotes', () => {
    const node: StringLiteralNode = {
      id: 'str-1',
      kind: 11,
      text: "'hello world'",
      value: 'hello world',
      quoteKind: 'single',
    };

    expect(node.kind).toBe(11);
    expect(node.text).toBe("'hello world'");
    expect(node.value).toBe('hello world');
    expect(node.quoteKind).toBe('single');
  });

  test('should create StringLiteralNode with double quotes', () => {
    const node: StringLiteralNode = {
      id: 'str-2',
      kind: 11,
      text: '"hello world"',
      value: 'hello world',
      quoteKind: 'double',
    };

    expect(node.text).toBe('"hello world"');
    expect(node.value).toBe('hello world');
    expect(node.quoteKind).toBe('double');
  });

  test('should handle escaped characters', () => {
    const node: StringLiteralNode = {
      id: 'str-escaped',
      kind: 11,
      text: '"line1\\nline2\\ttab"',
      value: 'line1\nline2\ttab',
      quoteKind: 'double',
    };

    expect(node.text).toBe('"line1\\nline2\\ttab"');
    expect(node.value).toBe('line1\nline2\ttab');
  });

  test('should handle empty string', () => {
    const node: StringLiteralNode = {
      id: 'str-empty',
      kind: 11,
      text: '""',
      value: '',
      quoteKind: 'double',
    };

    expect(node.text).toBe('""');
    expect(node.value).toBe('');
  });

  test('should handle unicode characters', () => {
    const node: StringLiteralNode = {
      id: 'str-unicode',
      kind: 11,
      text: '"Hello 世界 🌍"',
      value: 'Hello 世界 🌍',
      quoteKind: 'double',
    };

    expect(node.text).toBe('"Hello 世界 🌍"');
    expect(node.value).toBe('Hello 世界 🌍');
  });

  test('should identify StringLiteral nodes correctly', () => {
    const stringNode: StringLiteralNode = {
      id: 'str-1',
      kind: 11,
      text: '"test"',
      value: 'test',
      quoteKind: 'double',
    };

    const otherNode = {
      id: 'other-1',
      kind: 9,
      text: '42',
    };

    expect(isStringLiteral(stringNode)).toBe(true);
    expect(isStringLiteral(otherNode as any)).toBe(false);
  });
});
