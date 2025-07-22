/**
 * Tests for Arbores Query API
 */

import { describe, it, expect } from 'bun:test';
import { 
  getRoots,
  getNode,
  getChildren,
  getParents,
  getLatestRoot,
  getNodeWithKindName,
  validateAST
} from '../query';
import type { SourceFileAST, ASTNode, FileVersion } from '../types';

describe('Unit Tests - Query API', () => {
  // Mock AST data for testing
  const mockAST: SourceFileAST = {
    file_name: 'test.ts',
    versions: [
      {
        created_at: '2025-01-01T00:00:00Z',
        root_node_id: 'root_1',
        description: 'Initial version'
      },
      {
        created_at: '2025-01-02T00:00:00Z',
        root_node_id: 'root_2',
        description: 'Updated version'
      }
    ],
    nodes: {
      'root_1': {
        id: 'root_1',
        kind: 312, // SourceFile
        children: ['var_1']
      },
      'root_2': {
        id: 'root_2',
        kind: 312, // SourceFile
        children: ['var_2', 'func_1']
      },
      'var_1': {
        id: 'var_1',
        kind: 243, // VariableStatement
        text: 'const x = 42;'
      },
      'var_2': {
        id: 'var_2',
        kind: 243, // VariableStatement
        text: 'const y = "hello";'
      },
      'func_1': {
        id: 'func_1',
        kind: 261, // FunctionDeclaration
        text: 'function test() {}',
        children: ['param_1']
      },
      'param_1': {
        id: 'param_1',
        kind: 166, // Parameter
        text: 'param'
      }
    }
  };

  describe('getRoots', () => {
    it('should return all versions successfully', () => {
      const result = getRoots(mockAST);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]?.root_node_id).toBe('root_1');
        expect(result.data[1]?.root_node_id).toBe('root_2');
        expect(result.data[0]?.created_at).toBe('2025-01-01T00:00:00Z');
        expect(result.data[1]?.created_at).toBe('2025-01-02T00:00:00Z');
      }
    });

    it('should return error for invalid AST without versions', () => {
      const invalidAST = { ...mockAST, versions: undefined };
      const result = getRoots(invalidAST as any);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST_STRUCTURE');
        expect(result.error.message).toContain('versions field is missing');
      }
    });

    it('should return error for non-array versions', () => {
      const invalidAST = { ...mockAST, versions: 'invalid' };
      const result = getRoots(invalidAST as any);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST_STRUCTURE');
      }
    });
  });

  describe('getNode', () => {
    it('should return node successfully', () => {
      const result = getNode(mockAST, 'var_1');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('var_1');
        expect(result.data.kind).toBe(243);
        expect(result.data.text).toBe('const x = 42;');
      }
    });

    it('should return error for non-existent node', () => {
      const result = getNode(mockAST, 'non_existent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NODE_NOT_FOUND');
        expect(result.error.message).toContain('non_existent');
      }
    });

    it('should return error for AST without nodes', () => {
      const invalidAST = { ...mockAST, nodes: undefined };
      const result = getNode(invalidAST as any, 'var_1');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST_STRUCTURE');
        expect(result.error.message).toContain('nodes field is missing');
      }
    });

    it('should return a copy to avoid mutations', () => {
      const result = getNode(mockAST, 'root_1');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const originalNode = mockAST.nodes['root_1'];
        const returnedNode = result.data;
        
        if (!originalNode) {
          throw new Error('Original node should exist in mock data');
        }
        
        // Should be equal but not the same reference
        expect(returnedNode).toEqual(originalNode);
        expect(returnedNode).not.toBe(originalNode);
        
        // Children arrays should be different references
        if (returnedNode.children && originalNode.children) {
          expect(returnedNode.children).toEqual(originalNode.children);
          expect(returnedNode.children).not.toBe(originalNode.children);
        }
      }
    });
  });

  describe('getChildren', () => {
    it('should return children successfully', () => {
      const result = getChildren(mockAST, 'root_2');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]?.id).toBe('var_2');
        expect(result.data[1]?.id).toBe('func_1');
      }
    });

    it('should return empty array for node without children', () => {
      const result = getChildren(mockAST, 'var_1');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('should return error for non-existent parent node', () => {
      const result = getChildren(mockAST, 'non_existent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NODE_NOT_FOUND');
        expect(result.error.message).toContain('non_existent');
      }
    });

    it('should return error for broken child reference', () => {
      const brokenAST: SourceFileAST = {
        ...mockAST,
        nodes: {
          ...mockAST.nodes,
          'broken_parent': {
            id: 'broken_parent',
            kind: 312,
            children: ['non_existent_child']
          }
        }
      };

      const result = getChildren(brokenAST, 'broken_parent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST_STRUCTURE');
        expect(result.error.message).toContain('non_existent_child');
      }
    });
  });

  describe('getParents', () => {
    it('should return parents successfully', () => {
      const result = getParents(mockAST, 'var_2');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]?.id).toBe('root_2');
      }
    });

    it('should return empty array for root node', () => {
      const result = getParents(mockAST, 'root_1');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('should return error for non-existent target node', () => {
      const result = getParents(mockAST, 'non_existent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NODE_NOT_FOUND');
        expect(result.error.message).toContain('non_existent');
      }
    });

    it('should handle nested parent chain', () => {
      const result = getParents(mockAST, 'param_1');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data[0]?.id).toBe('func_1');
      }
    });
  });

  describe('getLatestRoot', () => {
    it('should return latest root node successfully', () => {
      const result = getLatestRoot(mockAST);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('root_2');
        expect(result.data.kind).toBe(312);
      }
    });

    it('should return error for AST without versions', () => {
      const astWithoutVersions = { ...mockAST, versions: [] };
      const result = getLatestRoot(astWithoutVersions);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST_STRUCTURE');
        expect(result.error.message).toContain('No versions found');
      }
    });

    it('should return error for version without root node ID', () => {
      const astWithInvalidVersion = {
        ...mockAST,
        versions: [{ created_at: '2025-01-01T00:00:00Z', root_node_id: '' }]
      };
      const result = getLatestRoot(astWithInvalidVersion);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST_STRUCTURE');
        expect(result.error.message).toContain('no root node ID');
      }
    });
  });

  describe('getNodeWithKindName', () => {
    it('should return node with kind name successfully', () => {
      const result = getNodeWithKindName(mockAST, 'var_1');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('var_1');
        expect(result.data.kind).toBe(243);
        expect(result.data.kindName).toBe('FirstStatement');
      }
    });

    it('should return error for non-existent node', () => {
      const result = getNodeWithKindName(mockAST, 'non_existent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NODE_NOT_FOUND');
      }
    });
  });

  describe('validateAST', () => {
    it('should validate correct AST successfully', () => {
      const result = validateAST(mockAST);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('should return error for non-object AST', () => {
      const result = validateAST(null as any);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST_STRUCTURE');
        expect(result.error.message).toContain('not an object');
      }
    });

    it('should return error for AST without nodes', () => {
      const invalidAST = { ...mockAST, nodes: undefined };
      const result = validateAST(invalidAST as any);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST_STRUCTURE');
        expect(result.error.message).toContain('nodes field');
      }
    });

    it('should return error for AST without versions', () => {
      const invalidAST = { ...mockAST, versions: undefined };
      const result = validateAST(invalidAST as any);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST_STRUCTURE');
        expect(result.error.message).toContain('versions field');
      }
    });

    it('should return error for broken child references', () => {
      const brokenAST: SourceFileAST = {
        ...mockAST,
        nodes: {
          ...mockAST.nodes,
          'broken_node': {
            id: 'broken_node',
            kind: 312,
            children: ['missing_child']
          }
        }
      };

      const result = validateAST(brokenAST);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST_STRUCTURE');
        expect(result.error.message).toContain('missing_child');
      }
    });

    it('should return error for version referencing missing root node', () => {
      const brokenAST: SourceFileAST = {
        ...mockAST,
        versions: [
          ...mockAST.versions,
          {
            created_at: '2025-01-03T00:00:00Z',
            root_node_id: 'missing_root'
          }
        ]
      };

      const result = validateAST(brokenAST);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST_STRUCTURE');
        expect(result.error.message).toContain('missing_root');
      }
    });
  });
});
