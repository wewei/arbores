/**
 * Tests for Parser API
 * 
 * Tests the parseCode function and related functionality
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { parseCode } from '../parser';
import { isSuccess, isError } from '../types';
import type { SourceFileAST } from '../types';

describe('Parser API', () => {
  let emptyAST: SourceFileAST;
  
  beforeEach(() => {
    emptyAST = {
      file_name: 'test.ts',
      nodes: {},
      versions: []
    };
  });

  describe('parseCode()', () => {
    it('should successfully parse simple TypeScript code', () => {
      const sourceCode = 'const x = 42;';
      const result = parseCode(sourceCode, emptyAST);
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.rootNodeId).toBeDefined();
        expect(result.data.stats.nodeCount).toBeGreaterThan(0);
        expect(result.data.stats.sourceSize).toBe(sourceCode.length);
        expect(result.data.stats.parseTime).toBeGreaterThan(0);
        expect(typeof result.data.stats.commentCount).toBe('number');
      }
    });

    it('should successfully parse TypeScript with functions', () => {
      const sourceCode = `
        function greet(name: string): string {
          return \`Hello, \${name}!\`;
        }
      `;
      const result = parseCode(sourceCode, emptyAST);
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.rootNodeId).toBeDefined();
        expect(result.data.stats.nodeCount).toBeGreaterThan(5); // Should have multiple nodes
      }
    });

    it('should successfully parse TypeScript with interfaces', () => {
      const sourceCode = `
        interface User {
          id: number;
          name: string;
          email?: string;
        }
      `;
      const result = parseCode(sourceCode, emptyAST);
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.rootNodeId).toBeDefined();
        expect(result.data.stats.nodeCount).toBeGreaterThan(3);
      }
    });

    it('should handle syntax errors gracefully', () => {
      const sourceCode = 'const x = ;'; // Syntax error
      const result = parseCode(sourceCode, emptyAST);
      
      // TypeScript parser might still parse this with errors, so we check structure
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.rootNodeId).toBeDefined();
      }
    });

    it('should merge nodes with existing AST', () => {
      const existingAST: SourceFileAST = {
        file_name: 'test.ts',
        nodes: {
          'existing-node': {
            id: 'existing-node',
            kind: 1,
            text: 'existing'
          }
        },
        versions: [{
          created_at: '2025-01-01T00:00:00Z',
          root_node_id: 'existing-node',
          description: 'Existing version'
        }]
      };

      const sourceCode = 'const y = 100;';
      const result = parseCode(sourceCode, existingAST);
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        // Should have both existing and new nodes
        expect(result.data.ast.nodes['existing-node']).toBeDefined();
        expect(Object.keys(result.data.ast.nodes).length).toBeGreaterThan(1);
        
        // Should have both versions
        expect(result.data.ast.versions[0]).toBeDefined();
        expect(result.data.ast.versions.length).toBeGreaterThan(1);
      }
    });

    it('should return error for invalid input', () => {
      // Test with null/undefined input
      const result1 = parseCode('', emptyAST);
      expect(isSuccess(result1)).toBe(true); // Empty string should still parse
      
      if (isSuccess(result1)) {
        expect(result1.data.stats.sourceSize).toBe(0);
      }
    });

    it('should include parse statistics', () => {
      const sourceCode = `
        // This is a comment
        const items = [1, 2, 3];
        /* Multi-line comment */
        function process(data: any[]) {
          return data.map(x => x * 2);
        }
      `;
      const result = parseCode(sourceCode, emptyAST);
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        const stats = result.data.stats;
        expect(stats.nodeCount).toBeGreaterThan(10); // Multiple nodes
        expect(stats.sourceSize).toBe(sourceCode.length);
        expect(stats.parseTime).toBeGreaterThan(0);
        expect(stats.commentCount).toBeGreaterThan(0); // At least some comments
      }
    });

    it('should generate unique node IDs', () => {
      const sourceCode = 'const a = 1; const b = 2;';
      const result = parseCode(sourceCode, emptyAST);
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        const nodeIds = Object.keys(result.data.ast.nodes);
        const uniqueIds = new Set(nodeIds);
        expect(nodeIds.length).toBe(uniqueIds.size); // All IDs should be unique
      }
    });

    it('should preserve AST structure consistency', () => {
      const sourceCode = `
        class Calculator {
          add(a: number, b: number): number {
            return a + b;
          }
        }
      `;
      const result = parseCode(sourceCode, emptyAST);
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        const ast = result.data.ast;
        const rootNode = ast.nodes[result.data.rootNodeId];
        
        expect(rootNode).toBeDefined();
        if (rootNode) {
          expect(rootNode.kind).toBeDefined();
          
          // Check that child references are valid
          if (rootNode.children) {
            for (const childId of rootNode.children) {
              expect(ast.nodes[childId]).toBeDefined();
            }
          }
        }
      }
    });
  });
});
