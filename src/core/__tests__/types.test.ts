/**
 * Tests for API Types
 * 
 * Tests the Result<T> type system and utility functions
 */

import { describe, it, expect } from 'bun:test';
import { 
  success, 
  error, 
  isSuccess, 
  isError,
  ArborError,
  type Result,
  type ErrorCode
} from '../types.ts';
import type { ASTNode, FileVersion } from '../types.ts';

describe('Unit Tests - Result<T> Type System', () => {
  describe('success()', () => {
    it('should create a success result', () => {
      const data = { message: 'hello' };
      const result = success(data);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });
  });

  describe('error()', () => {
    it('should create an error result', () => {
      const result = error('PARSE_ERROR', 'Failed to parse');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ArborError);
        expect(result.error.code).toBe('PARSE_ERROR');
        expect(result.error.message).toBe('Failed to parse');
      }
    });
  });

  describe('Type guards', () => {
    it('isSuccess() should correctly identify success results', () => {
      const successResult = success('data');
      const errorResult = error('NODE_NOT_FOUND', 'Not found');
      
      expect(isSuccess(successResult)).toBe(true);
      expect(isSuccess(errorResult)).toBe(false);
    });

    it('isError() should correctly identify error results', () => {
      const successResult = success('data');
      const errorResult = error('NODE_NOT_FOUND', 'Not found');
      
      expect(isError(successResult)).toBe(false);
      expect(isError(errorResult)).toBe(true);
    });
  });
});

describe('ArborError', () => {
  it('should create proper error instances', () => {
    const errorCodes: ErrorCode[] = ['PARSE_ERROR', 'NODE_NOT_FOUND', 'INVALID_JSON', 'INVALID_AST_STRUCTURE'];
    
    errorCodes.forEach(code => {
      const error = new ArborError(code, `Test ${code}`);
      expect(error.code).toBe(code);
      expect(error.message).toBe(`Test ${code}`);
      expect(error.name).toBe('ArborError');
      expect(error instanceof Error).toBe(true);
    });
  });
});

describe('Conversion Functions', () => {
  describe('Type Re-exports', () => {
    it('should properly re-export types from src/types.ts', () => {
      // This is a compile-time test - if it compiles, the re-exports work
      const astNode: ASTNode = {
        id: 'test',
        kind: 80
      };
      
      const version: FileVersion = {
        created_at: '2025-01-01T00:00:00Z',
        root_node_id: 'root'
      };
      
      expect(astNode.id).toBe('test');
      expect(version.created_at).toBe('2025-01-01T00:00:00Z');
    });
  });
});

describe('Result<T> Practical Usage', () => {
  // Helper function that returns Result<T>
  const divideNumbers = (a: number, b: number): Result<number> => {
    if (b === 0) {
      return error('PARSE_ERROR', 'Division by zero');
    }
    return success(a / b);
  };

  it('should handle success case in practical usage', () => {
    const result = divideNumbers(10, 2);
    
    expect(isSuccess(result)).toBe(true);
    
    if (isSuccess(result)) {
      expect(result.data).toBe(5);
    }
  });

  it('should handle error case in practical usage', () => {
    const result = divideNumbers(10, 0);
    
    expect(isError(result)).toBe(true);
    
    if (isError(result)) {
      expect(result.error.code).toBe('PARSE_ERROR');
      expect(result.error.message).toBe('Division by zero');
    }
  });

  it('should work with async functions', async () => {
    const asyncDivide = async (a: number, b: number): Promise<Result<number>> => {
      await new Promise(resolve => setTimeout(resolve, 1)); // Small delay
      return divideNumbers(a, b);
    };

    const result = await asyncDivide(8, 4);
    expect(isSuccess(result)).toBe(true);
    
    if (isSuccess(result)) {
      expect(result.data).toBe(2);
    }
  });
});
