/**
 * Identifier 类型单元测试
 */
import { expect, test, describe } from 'bun:test';
import type { IdentifierNode } from '../types/s080-identifier';
import { isIdentifier } from '../types/s080-identifier';

describe('Identifier', () => {
  test('should create IdentifierNode with simple identifier', () => {
    const node: IdentifierNode = {
      id: 'id-1',
      kind: 80,
      text: 'myVariable',
      escapedText: 'myVariable',
    };

    expect(node.kind).toBe(80);
    expect(node.text).toBe('myVariable');
    expect(node.escapedText).toBe('myVariable');
    expect(node.id).toBe('id-1');
  });

  test('should handle identifiers with underscores and numbers', () => {
    const node: IdentifierNode = {
      id: 'id-complex',
      kind: 80,
      text: '_myVar123',
      escapedText: '_myVar123',
    };

    expect(node.text).toBe('_myVar123');
    expect(node.escapedText).toBe('_myVar123');
  });

  test('should handle dollar sign in identifiers', () => {
    const node: IdentifierNode = {
      id: 'id-dollar',
      kind: 80,
      text: '$variable',
      escapedText: '$variable',
    };

    expect(node.text).toBe('$variable');
    expect(node.escapedText).toBe('$variable');
  });

  test('should handle Unicode identifiers', () => {
    const node: IdentifierNode = {
      id: 'id-unicode',
      kind: 80,
      text: '变量名',
      escapedText: '变量名',
    };

    expect(node.text).toBe('变量名');
    expect(node.escapedText).toBe('变量名');
  });

  test('should handle escaped Unicode identifiers', () => {
    // Example: var \\u0076\\u0061\\u0072 = "var";
    const node: IdentifierNode = {
      id: 'id-escaped-unicode',
      kind: 80,
      text: '\\u0076\\u0061\\u0072',
      escapedText: 'var',
    };

    expect(node.text).toBe('\\u0076\\u0061\\u0072');
    expect(node.escapedText).toBe('var');
  });

  test('should identify Identifier nodes correctly', () => {
    const identifierNode: IdentifierNode = {
      id: 'id-1',
      kind: 80,
      text: 'myVar',
      escapedText: 'myVar',
    };

    const otherNode = {
      id: 'other-1',
      kind: 11,
      text: '"string"',
    };

    expect(isIdentifier(identifierNode)).toBe(true);
    expect(isIdentifier(otherNode as any)).toBe(false);
  });
});
