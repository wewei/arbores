/**
 * Tree API Tests
 */

import { describe, it, expect } from 'bun:test';
import { renderTree } from '../tree';
import type { SourceFileAST, TreeRenderOptions } from '../types';

describe('Tree API', () => {
  // Mock AST for testing
  const mockAST: SourceFileAST = {
    file_name: 'test.ts',
    versions: [
      {
        created_at: '2024-01-01T00:00:00.000Z',
        root_node_id: 'root',
        description: 'Test version'
      }
    ],
    nodes: {
      'root': {
        id: 'root',
        kind: 312, // SourceFile
        children: ['stmt1', 'stmt2'],
        leadingComments: [
          { kind: 'SingleLineCommentTrivia' as const, text: '// This is a test file' }
        ]
      },
      'stmt1': {
        id: 'stmt1',
        kind: 261, // FunctionDeclaration
        text: 'function hello() { return "world"; }',
        children: ['param1'],
        trailingComments: [
          { kind: 'SingleLineCommentTrivia' as const, text: '// A simple function' }
        ]
      },
      'param1': {
        id: 'param1',
        kind: 166, // Parameter
        text: 'name: string'
      },
      'stmt2': {
        id: 'stmt2',
        kind: 243, // VariableStatement
        text: 'const x = 42;',
        children: []
      }
    }
  };

  describe('renderTree', () => {
    it('should render basic tree structure', () => {
      const result = renderTree(mockAST, 'root');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.length).toBeGreaterThan(0);
        expect(lines[0]).toMatch(/SourceFile \(312\)/);
        expect(lines).toContainEqual(expect.stringMatching(/FunctionDeclaration \(261\)/));
        expect(lines).toContainEqual(expect.stringMatching(/VariableStatement \(243\)/));
      }
    });

    it('should show comments when enabled', () => {
      const options: TreeRenderOptions = { showComments: true };
      const result = renderTree(mockAST, 'root', options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('[//] This is a test file'))).toBe(true);
        expect(lines.some(line => line.includes('[//] A simple function'))).toBe(true);
      }
    });

    it('should hide comments when disabled', () => {
      const options: TreeRenderOptions = { showComments: false };
      const result = renderTree(mockAST, 'root', options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('[//]'))).toBe(false);
      }
    });

    it('should show text content when enabled', () => {
      const options: TreeRenderOptions = { showText: true };
      const result = renderTree(mockAST, 'root', options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('# function hello()'))).toBe(true);
        expect(lines.some(line => line.includes('# const x = 42;'))).toBe(true);
      }
    });

    it('should hide text content when disabled', () => {
      const options: TreeRenderOptions = { showText: false };
      const result = renderTree(mockAST, 'root', options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('# function hello()'))).toBe(false);
        expect(lines.some(line => line.includes('# const x = 42;'))).toBe(false);
      }
    });

    it('should show node IDs when enabled', () => {
      const options: TreeRenderOptions = { showNodeIds: true };
      const result = renderTree(mockAST, 'root', options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('[root]'))).toBe(true);
        expect(lines.some(line => line.includes('[stmt1]'))).toBe(true);
        expect(lines.some(line => line.includes('[stmt2]'))).toBe(true);
      }
    });

    it('should respect custom maxWidth', () => {
      const options: TreeRenderOptions = { maxWidth: 50 };
      const result = renderTree(mockAST, 'root', options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        lines.forEach(line => {
          expect(line.length).toBeLessThanOrEqual(50);
        });
      }
    });

    it('should use custom text prefix', () => {
      const options: TreeRenderOptions = { textPrefix: '-> ' };
      const result = renderTree(mockAST, 'root', options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('-> function hello()'))).toBe(true);
      }
    });

    it('should return error for missing node', () => {
      const result = renderTree(mockAST, 'nonexistent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NODE_NOT_FOUND');
        expect(result.error.message).toContain('nonexistent');
      }
    });

    it('should return error for invalid AST', () => {
      const invalidAST = {} as SourceFileAST;
      const result = renderTree(invalidAST, 'root');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AST');
      }
    });

    it('should return error for empty node ID', () => {
      const result = renderTree(mockAST, '');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_ARGUMENT');
      }
    });
  });

  describe('tree line formatting', () => {
    it('should properly format tree structure with branches', () => {
      const result = renderTree(mockAST, 'root');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        
        // Check tree structure characters
        expect(lines.some(line => line.includes('└──'))).toBe(true); // Last child
        expect(lines.some(line => line.includes('├──'))).toBe(true); // Non-last child
      }
    });

    it('should handle missing child nodes gracefully', () => {
      const astWithMissingChild: SourceFileAST = {
        ...mockAST,
        nodes: {
          ...mockAST.nodes,
          'root': {
            id: 'root',
            kind: 312,
            children: ['stmt1', 'missing_node', 'stmt2'],
            leadingComments: [
              { kind: 'SingleLineCommentTrivia' as const, text: '// This is a test file' }
            ]
          }
        }
      };

      const result = renderTree(astWithMissingChild, 'root');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('❌ Missing node: missing_node'))).toBe(true);
      }
    });
  });
});
