import { describe, it, expect } from 'bun:test';
import { PegParserManager, createParserManager, parseWithModel } from '../parser-wrapper';
import type { BNFModel } from '../types';

describe('PEG Parser Wrapper', () => {
  // Simple test BNF model
  const simpleMathModel: BNFModel = {
    name: 'SimpleMath',
    version: '1.0.0',
    start: 'Expression',
    nodes: {
      Expression: {
        type: 'deduction',
        description: 'Mathematical expression',
        sequence: [
          { node: 'Number', prop: 'left' },
          { node: 'Operator', prop: 'operator' },
          { node: 'Number', prop: 'right' }
        ]
      },
      Number: {
        type: 'token',
        description: 'Numeric literal',
        pattern: { regex: '\\d+' }
      },
      Operator: {
        type: 'union',
        description: 'Mathematical operator',
        members: ['Plus', 'Minus']
      },
      Plus: {
        type: 'token',
        description: 'Addition operator',
        pattern: '+'
      },
      Minus: {
        type: 'token',
        description: 'Subtraction operator',
        pattern: '-'
      }
    }
  };

  describe('PegParserManager', () => {
    it('should create a parser manager instance', () => {
      const manager = new PegParserManager();
      expect(manager).toBeDefined();
      expect(typeof manager.compileParser).toBe('function');
    });

    it('should accept configuration options', () => {
      const config = {
        includeLocation: false,
        includeDebugInfo: true,
        optimize: false,
        cacheParser: false
      };

      const manager = new PegParserManager(config);
      expect(manager).toBeDefined();
    });

    it('should compile a parser from BNF model', async () => {
      const manager = createParserManager();
      const result = await manager.compileParser(simpleMathModel);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.parser).toBeDefined();
        expect(typeof result.parser.parse).toBe('function');
        expect(typeof result.parser.getInfo).toBe('function');
        expect(typeof result.parser.validate).toBe('function');
      }
    });

    it('should return parser info correctly', async () => {
      const manager = createParserManager();
      const result = await manager.compileParser(simpleMathModel);

      expect(result.success).toBe(true);
      if (result.success) {
        const info = result.parser.getInfo();
        expect(info.grammarName).toBe('SimpleMath');
        expect(info.startRule).toBe('Expression');
        expect(info.rules).toContain('Expression');
        expect(info.rules).toContain('Number');
        expect(info.rules).toContain('Operator');
      }
    });

    it('should validate parser correctly', async () => {
      const manager = createParserManager();
      const result = await manager.compileParser(simpleMathModel);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.parser.validate()).toBe(true);
      }
    });

    it('should handle caching', async () => {
      const manager = createParserManager({ cacheParser: true });

      // First compilation
      const result1 = await manager.compileParser(simpleMathModel);
      expect(result1.success).toBe(true);

      // Second compilation should use cache
      const result2 = await manager.compileParser(simpleMathModel);
      expect(result2.success).toBe(true);

      const stats = manager.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should clear cache correctly', async () => {
      const manager = createParserManager({ cacheParser: true });

      await manager.compileParser(simpleMathModel);
      expect(manager.getCacheStats().size).toBeGreaterThan(0);

      manager.clearCache();
      expect(manager.getCacheStats().size).toBe(0);
    });

    it('should handle invalid models gracefully', async () => {
      const manager = createParserManager();

      const invalidModel: BNFModel = {
        name: 'Invalid',
        version: '1.0.0',
        start: 'NonExistentRule',
        nodes: {
          SomeRule: {
            type: 'token',
            description: 'Some token',
            pattern: 'test'
          }
        }
      };

      const result = await manager.compileParser(invalidModel);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('NonExistentRule');
      }
    });
  });

  describe('Parser Compilation', () => {
    it('should generate warnings for left recursion', async () => {
      const leftRecursiveModel: BNFModel = {
        name: 'LeftRecursive',
        version: '1.0.0',
        start: 'Expression',
        nodes: {
          Expression: {
            type: 'deduction',
            description: 'Left recursive expression',
            sequence: ['Expression', 'Plus', 'Number']
          },
          Plus: {
            type: 'token',
            description: 'Plus operator',
            pattern: '+'
          },
          Number: {
            type: 'token',
            description: 'Number token',
            pattern: { regex: '\\d+' }
          }
        }
      };

      const manager = createParserManager();
      const result = await manager.compileParser(leftRecursiveModel);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
      expect(result.warnings!.some(w => w.includes('Left recursion'))).toBe(true);
    });

    it('should handle complex patterns', async () => {
      const complexModel: BNFModel = {
        name: 'Complex',
        version: '1.0.0',
        start: 'Pattern',
        nodes: {
          Pattern: {
            type: 'token',
            description: 'Complex regex pattern',
            pattern: { regex: '(?:(?:[a-zA-Z]+|\\d+)+)*' }
          }
        }
      };

      const manager = createParserManager();
      const result = await manager.compileParser(complexModel);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
    });
  });

  describe('Convenience Functions', () => {
    it('should create parser manager with createParserManager', () => {
      const manager = createParserManager();
      expect(manager).toBeInstanceOf(PegParserManager);
    });

    it('should parse with model using parseWithModel', async () => {
      // Note: This will fail with our mock PEG.js implementation
      // but it tests the API structure
      const result = await parseWithModel(simpleMathModel, '1 + 2');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('PEG.js parser not available');
      }
    });

    it('should handle parser configuration in parseWithModel', async () => {
      const result = await parseWithModel(
        simpleMathModel,
        '1 + 2',
        {
          parserConfig: { includeLocation: false },
          startRule: 'Expression'
        }
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('PEG.js parser not available');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle compilation errors gracefully', async () => {
      const manager = createParserManager();

      // Test with a model that will cause PEG generation issues
      const problematicModel: BNFModel = {
        name: 'Problematic',
        version: '1.0.0',
        start: 'Start',
        nodes: {
          Start: {
            type: 'deduction',
            description: 'Problematic rule',
            sequence: ['NonExistent']
          }
        }
      };

      const result = await manager.compileParser(problematicModel);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should handle parse errors gracefully', async () => {
      const manager = createParserManager();
      const result = await manager.compileParser(simpleMathModel);

      expect(result.success).toBe(true);
      if (result.success) {
        // This will fail with our mock implementation
        const parseResult = result.parser.parse('invalid input');
        expect(parseResult.success).toBe(false);
        if (!parseResult.success) {
          expect(parseResult.error).toBeDefined();
        }
      }
    });
  });

  describe('Type Safety', () => {
    it('should provide type-safe parse results', async () => {
      interface MathExpression {
        left: { text: string };
        operator: string;
        right: { text: string };
      }

      const manager = createParserManager();
      const result = await manager.compileParser<MathExpression>(simpleMathModel);

      expect(result.success).toBe(true);
      if (result.success) {
        // The parser is typed for MathExpression
        const parseResult = result.parser.parse('1 + 2');
        expect(parseResult.success).toBe(false); // Mock implementation fails
      }
    });
  });
});
