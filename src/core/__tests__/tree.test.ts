/**
 * Tree API Tests
 */

import { describe, it, expect } from 'bun:test';
import { renderTree } from '../tree';
import type { SourceFileAST, TreeRenderOptions } from '../types';
import { parseCode } from '../parser';

describe('Tree API', () => {
  // Create a real AST using parseCode instead of a mock AST
  const testCode = `// This is a test file
function hello() { 
  return "world"; 
} // A simple function

const x = 42;`;

  // Initialize empty AST structure
  const emptyAST: SourceFileAST = {
    file_name: 'test.ts',
    versions: [],
    nodes: {}
  };

  // Generate real AST from the test code
  const parseResult = parseCode(testCode, emptyAST, 'Test version');
  let realAST: SourceFileAST;
  let rootNodeId: string;

  // Make sure we have a valid AST before running tests
  if (parseResult.success && parseResult.data) {
    realAST = parseResult.data.ast;
    rootNodeId = parseResult.data.rootNodeId;
  } else {
    throw new Error('Failed to generate test AST');
  }

  describe('renderTree', () => {
    it('should render basic tree structure', () => {
      const result = renderTree(realAST, rootNodeId);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.length).toBeGreaterThan(0);
        expect(lines.some(line => line.includes('SourceFile'))).toBe(true);
        expect(lines.some(line => line.includes('FunctionDeclaration'))).toBe(true);
        expect(lines.some(line => line.includes('VariableStatement'))).toBe(true); // VariableStatement shows correctly after filtering FirstStatement
      }
    });

    it('should show comments when enabled', () => {
      const options: TreeRenderOptions = { showComments: true };
      const result = renderTree(realAST, rootNodeId, options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('[//] This is a test file'))).toBe(true);
        expect(lines.some(line => line.includes('[//] A simple function'))).toBe(true);
      }
    });

    it('should hide comments when disabled', () => {
      const options: TreeRenderOptions = { showComments: false };
      const result = renderTree(realAST, rootNodeId, options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('[//]'))).toBe(false);
      }
    });

    it('should show text content when enabled', () => {
      const options: TreeRenderOptions = { showText: true };
      const result = renderTree(realAST, rootNodeId, options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('# hello'))).toBe(true); // Identifier name
        expect(lines.some(line => line.includes('# const'))).toBe(true); // const keyword
      }
    });

    it('should hide text content when disabled', () => {
      const options: TreeRenderOptions = { showText: false };
      const result = renderTree(realAST, rootNodeId, options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('# hello'))).toBe(false);
        expect(lines.some(line => line.includes('# const'))).toBe(false);
      }
    });

    it('should show node IDs when enabled', () => {
      const options: TreeRenderOptions = { showNodeIds: true };
      const result = renderTree(realAST, rootNodeId, options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        // We can't check for specific node IDs as they are generated dynamically
        // So we just check that ID markers are present
        expect(lines.some(line => line.includes('['))).toBe(true);
      }
    });

    it('should respect custom maxWidth', () => {
      const options: TreeRenderOptions = { maxWidth: 50 };
      const result = renderTree(realAST, rootNodeId, options);
      
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
      const result = renderTree(realAST, rootNodeId, options);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('-> hello'))).toBe(true); // Identifier name
      }
    });

    it('should return error for missing node', () => {
      const result = renderTree(realAST, 'nonexistent');
      
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
      const result = renderTree(realAST, '');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_ARGUMENT');
      }
    });
  });

  describe('tree line formatting', () => {
    it('should properly format tree structure with branches', () => {
      const result = renderTree(realAST, rootNodeId);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        
        // Check tree structure characters
        expect(lines.some(line => line.includes('└──'))).toBe(true); // Last child
        expect(lines.some(line => line.includes('├──'))).toBe(true); // Non-last child
      }
    });

    it('should handle missing child nodes gracefully', () => {
      // Create a copy of the AST with a missing node reference
      const modifiedAST: SourceFileAST = {
        ...realAST,
        nodes: {
          ...realAST.nodes
        }
      };

      // Add a missing node reference to the root node's children array
      const rootNode = modifiedAST.nodes[rootNodeId];
      if (rootNode && rootNode.children) {
        const modifiedRootNode: typeof rootNode = {
          ...rootNode,
          children: [...rootNode.children, 'missing_node']
        };
        modifiedAST.nodes[rootNodeId] = modifiedRootNode;
      }

      const result = renderTree(modifiedAST, rootNodeId);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data;
        expect(lines.some(line => line.includes('❌ Missing node: missing_node'))).toBe(true);
      }
    });
  });
});
