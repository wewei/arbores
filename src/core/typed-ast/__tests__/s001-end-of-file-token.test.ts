/**
 * EndOfFileToken 类型单元测试
 */
import { expect, test, describe } from 'bun:test';
import type { EndOfFileTokenNode } from '../types/s001-end-of-file-token';
import { isEndOfFileToken } from '../types/s001-end-of-file-token';

describe('EndOfFileToken', () => {
  test('should create EndOfFileTokenNode with correct properties', () => {
    const node: EndOfFileTokenNode = {
      id: 'eof-1',
      kind: 1,
      text: '',
    };

    expect(node.kind).toBe(1);
    expect(node.text).toBe('');
    expect(node.id).toBe('eof-1');
  });

  test('should identify EndOfFileToken nodes correctly', () => {
    const endOfFileNode: EndOfFileTokenNode = {
      id: 'eof-1',
      kind: 1,
      text: '',
    };

    const otherNode = {
      id: 'other-1',
      kind: 2,
      text: '// comment',
    };

    expect(isEndOfFileToken(endOfFileNode)).toBe(true);
    expect(isEndOfFileToken(otherNode as any)).toBe(false);
  });

  test('should enforce empty text for EndOfFileToken', () => {
    const node: EndOfFileTokenNode = {
      id: 'eof-1',
      kind: 1,
      text: '', // Must be empty string
    };

    // TypeScript should enforce this at compile time
    expect(node.text).toBe('');
  });
});
