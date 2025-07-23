/**
 * BigIntLiteral 转换器单元测试
 */
import { expect, test, describe } from 'bun:test';
import type { ASTNode } from '../../types';
import type { BigIntLiteralNode } from '../types/s010-big-int-literal';
import {
  bigIntLiteralFromASTNode,
  bigIntLiteralToASTNode,
  bigIntLiteralFromTsNode
} from '../converters/s010-big-int-literal';
import * as ts from 'typescript';

describe('BigIntLiteral Converter', () => {
  describe('bigIntLiteralFromASTNode', () => {
    test('should convert decimal BigInt ASTNode', () => {
      const astNode: ASTNode = {
        id: 'bigint-1',
        kind: 10,
        text: '123456789012345678901234567890n',
      };

      const result = bigIntLiteralFromASTNode(astNode);

      expect(result.id).toBe('bigint-1');
      expect(result.kind).toBe(10);
      expect(result.text).toBe('123456789012345678901234567890n');
      expect(result.value).toBe('123456789012345678901234567890');
      expect(result.base).toBe(10);
    });

    test('should convert hexadecimal BigInt ASTNode', () => {
      const astNode: ASTNode = {
        id: 'bigint-hex',
        kind: 10,
        text: '0xFFFFFFFFFFFFFFFFn',
      };

      const result = bigIntLiteralFromASTNode(astNode);

      expect(result.text).toBe('0xFFFFFFFFFFFFFFFFn');
      expect(result.value).toBe('FFFFFFFFFFFFFFFF');
      expect(result.base).toBe(16);
    });

    test('should convert binary BigInt ASTNode', () => {
      const astNode: ASTNode = {
        id: 'bigint-bin',
        kind: 10,
        text: '0b11111111111111111111111111111111n',
      };

      const result = bigIntLiteralFromASTNode(astNode);

      expect(result.text).toBe('0b11111111111111111111111111111111n');
      expect(result.value).toBe('11111111111111111111111111111111');
      expect(result.base).toBe(2);
    });

    test('should convert octal BigInt ASTNode', () => {
      const astNode: ASTNode = {
        id: 'bigint-oct',
        kind: 10,
        text: '0o777777777777777777n',
      };

      const result = bigIntLiteralFromASTNode(astNode);

      expect(result.text).toBe('0o777777777777777777n');
      expect(result.value).toBe('777777777777777777');
      expect(result.base).toBe(8);
    });

    test('should handle uppercase prefixes', () => {
      const hexNode: ASTNode = {
        id: 'hex-upper',
        kind: 10,
        text: '0XFFn',
      };

      const binNode: ASTNode = {
        id: 'bin-upper',
        kind: 10,
        text: '0B1111n',
      };

      const octNode: ASTNode = {
        id: 'oct-upper',
        kind: 10,
        text: '0O777n',
      };

      expect(bigIntLiteralFromASTNode(hexNode).base).toBe(16);
      expect(bigIntLiteralFromASTNode(binNode).base).toBe(2);
      expect(bigIntLiteralFromASTNode(octNode).base).toBe(8);
    });

    test('should preserve comments', () => {
      const astNode: ASTNode = {
        id: 'bigint-with-comments',
        kind: 10,
        text: '123n',
        leadingComments: [{ kind: 'SingleLineCommentTrivia', text: '// leading' }],
        trailingComments: [{ kind: 'SingleLineCommentTrivia', text: '// trailing' }],
      };

      const result = bigIntLiteralFromASTNode(astNode);

      expect(result.leadingComments).toEqual([{ kind: 'SingleLineCommentTrivia', text: '// leading' }]);
      expect(result.trailingComments).toEqual([{ kind: 'SingleLineCommentTrivia', text: '// trailing' }]);
    });
  });

  describe('bigIntLiteralToASTNode', () => {
    test('should convert BigIntLiteralNode back to ASTNode', () => {
      const bigIntNode: BigIntLiteralNode = {
        id: 'bigint-1',
        kind: 10,
        text: '123456789012345678901234567890n',
        value: '123456789012345678901234567890',
        base: 10,
      };

      const result = bigIntLiteralToASTNode(bigIntNode);

      expect(result.id).toBe('bigint-1');
      expect(result.kind).toBe(10);
      expect(result.text).toBe('123456789012345678901234567890n');
    });

    test('should preserve comments in reverse conversion', () => {
      const bigIntNode: BigIntLiteralNode = {
        id: 'bigint-comments',
        kind: 10,
        text: '456n',
        value: '456',
        base: 10,
        leadingComments: [{ kind: 'MultiLineCommentTrivia', text: '/* leading */' }],
        trailingComments: [{ kind: 'MultiLineCommentTrivia', text: '/* trailing */' }],
      };

      const result = bigIntLiteralToASTNode(bigIntNode);

      expect(result.leadingComments).toEqual([{ kind: 'MultiLineCommentTrivia', text: '/* leading */' }]);
      expect(result.trailingComments).toEqual([{ kind: 'MultiLineCommentTrivia', text: '/* trailing */' }]);
    });
  });

  describe('bigIntLiteralFromTsNode', () => {
    test('should convert TypeScript BigIntLiteral node', () => {
      // 创建一个模拟的 TypeScript BigIntLiteral 节点
      const mockTsNode = {
        text: '789012345678901234567890n',
        pos: 10,
        end: 35,
      } as ts.BigIntLiteral;

      const result = bigIntLiteralFromTsNode(mockTsNode);

      expect(result.id).toBe('bigint-10-35');
      expect(result.kind).toBe(10);
      expect(result.text).toBe('789012345678901234567890n');
      expect(result.value).toBe('789012345678901234567890');
      expect(result.base).toBe(10);
    });

    test('should handle TypeScript hex BigInt node', () => {
      const mockTsNode = {
        text: '0xDEADBEEFn',
        pos: 5,
        end: 16,
      } as ts.BigIntLiteral;

      const result = bigIntLiteralFromTsNode(mockTsNode);

      expect(result.text).toBe('0xDEADBEEFn');
      expect(result.value).toBe('DEADBEEF');
      expect(result.base).toBe(16);
    });
  });

  describe('Edge cases and validation', () => {
    test('should handle empty text gracefully', () => {
      const astNode: ASTNode = {
        id: 'empty',
        kind: 10,
        text: '',
      };

      const result = bigIntLiteralFromASTNode(astNode);

      expect(result.text).toBe('');
      expect(result.value).toBe('');
      expect(result.base).toBe(10);
    });

    test('should handle malformed BigInt text', () => {
      const astNode: ASTNode = {
        id: 'malformed',
        kind: 10,
        text: 'not-a-bigint',
      };

      const result = bigIntLiteralFromASTNode(astNode);

      expect(result.text).toBe('not-a-bigint');
      expect(result.value).toBe('not-a-bigint');
      expect(result.base).toBe(10);
    });
  });
});
