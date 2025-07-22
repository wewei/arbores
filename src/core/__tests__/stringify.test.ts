/**
 * Tests for Arbores Stringify API
 */

import { describe, it, expect } from 'bun:test';
import { 
  stringifyNode, 
  stringifyNodes,
  stringifyVersion,
  stringifyLatestVersion,
  isValidStringifyFormat,
  type StringifyOptions,
  type StringifyResult
} from '../stringify';
import type { SourceFileAST, FileVersion } from '../types';

describe('Unit Tests - Stringify API', () => {
  // Mock AST data for testing
  const mockAST: SourceFileAST = {
    file_name: 'test.ts',
    versions: [
      {
        created_at: '2025-01-01T00:00:00Z',
        root_node_id: 'root_1',
        description: 'Initial version'
      }
    ],
    nodes: {
      'root_1': {
        id: 'root_1',
        kind: 312, // SourceFile
        children: ['var_1']
      },
      'var_1': {
        id: 'var_1',
        kind: 254, // VariableStatement
        text: 'const x = 42;'
      }
    }
  };

  const mockOptions: StringifyOptions = {
    format: 'readable'
  };

  describe('stringifyNode', () => {
    it('should return success for valid node with text', () => {
      const result = stringifyNode('var_1', mockAST, mockOptions);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('const x = 42;');
        expect(result.data.nodeId).toBe('var_1');
        expect(result.data.format).toBe('readable');
      }
    });

    it('should return error for non-existent node', () => {
      const result = stringifyNode('non_existent', mockAST, mockOptions);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NODE_NOT_FOUND');
        expect(result.error.message).toContain('non_existent');
      }
    });

    it('should return error for invalid nodeId', () => {
      const result = stringifyNode('', mockAST, mockOptions);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_ARGUMENT');
        expect(result.error.message).toContain('Node ID must be a non-empty string');
      }
    });

    it('should return error for invalid AST', () => {
      const result = stringifyNode('var_1', null as any, mockOptions);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_ARGUMENT');
        expect(result.error.message).toContain('AST must be a valid object');
      }
    });

    it('should return error for AST without nodes', () => {
      const invalidAST = { ...mockAST, nodes: undefined };
      const result = stringifyNode('var_1', invalidAST as any, mockOptions);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST');
        expect(result.error.message).toContain('AST must contain a nodes object');
      }
    });

    it('should use default format when not specified', () => {
      const result = stringifyNode('var_1', mockAST);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.format).toBe('readable');
      }
    });
  });

  describe('stringifyNodes', () => {
    it('should stringify multiple nodes successfully', () => {
      const nodeIds = ['var_1'];
      const result = stringifyNodes(nodeIds, mockAST, mockOptions);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]?.nodeId).toBe('var_1');
        expect(result.data[0]?.code).toBe('const x = 42;');
      }
    });

    it('should return error for invalid nodeIds array', () => {
      const result = stringifyNodes('not_an_array' as any, mockAST, mockOptions);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_ARGUMENT');
        expect(result.error.message).toContain('nodeIds must be an array');
      }
    });

    it('should return error if any node fails to stringify', () => {
      const nodeIds = ['var_1', 'non_existent'];
      const result = stringifyNodes(nodeIds, mockAST, mockOptions);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('STRINGIFY_FAILED');
        expect(result.error.message).toContain('non_existent');
      }
    });
  });

  describe('stringifyVersion', () => {
    it('should stringify version root node successfully', () => {
      const version = mockAST.versions[0];
      if (!version) {
        throw new Error('Mock version should exist');
      }
      const result = stringifyVersion(version, mockAST, mockOptions);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nodeId).toBe('root_1');
      }
    });

    it('should return error for invalid version', () => {
      const result = stringifyVersion(null as any, mockAST, mockOptions);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_ARGUMENT');
        expect(result.error.message).toContain('Version must be a valid object');
      }
    });

    it('should return error for version without root_node_id', () => {
      const invalidVersion = { created_at: '2025-01-01T00:00:00Z' } as FileVersion;
      const result = stringifyVersion(invalidVersion, mockAST, mockOptions);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_VERSION');
        expect(result.error.message).toContain('root_node_id');
      }
    });
  });

  describe('stringifyLatestVersion', () => {
    it('should stringify latest version successfully', () => {
      const result = stringifyLatestVersion(mockAST, mockOptions);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nodeId).toBe('root_1');
      }
    });

    it('should return error for invalid AST', () => {
      const result = stringifyLatestVersion(null as any, mockOptions);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_ARGUMENT');
        expect(result.error.message).toContain('AST must be a valid object');
      }
    });

    it('should return error for AST without versions', () => {
      const astWithoutVersions = { ...mockAST, versions: [] };
      const result = stringifyLatestVersion(astWithoutVersions, mockOptions);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST');
        expect(result.error.message).toContain('at least one version');
      }
    });
  });

  describe('isValidStringifyFormat', () => {
    it('should return true for valid formats', () => {
      expect(isValidStringifyFormat('compact')).toBe(true);
      expect(isValidStringifyFormat('readable')).toBe(true);
      expect(isValidStringifyFormat('minified')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(isValidStringifyFormat('invalid')).toBe(false);
      expect(isValidStringifyFormat(123)).toBe(false);
      expect(isValidStringifyFormat(null)).toBe(false);
      expect(isValidStringifyFormat(undefined)).toBe(false);
    });
  });

  describe('StringifyOptions', () => {
    it('should handle different format options', () => {
      const formats: Array<'compact' | 'readable' | 'minified'> = ['compact', 'readable', 'minified'];
      
      for (const format of formats) {
        const options: StringifyOptions = { format };
        const result = stringifyNode('var_1', mockAST, options);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.format).toBe(format);
        }
      }
    });

    it('should handle empty options', () => {
      const result = stringifyNode('var_1', mockAST, {});
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.format).toBe('readable'); // default
      }
    });
  });
});
