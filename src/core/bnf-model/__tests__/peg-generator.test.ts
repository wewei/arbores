/**
 * Tests for PEG.js Grammar Generator
 */

import { describe, it, expect } from 'bun:test';
import { PegGenerator, generatePegGrammar, PegGenerationError } from '../peg-generator';
import type { BNFModel } from '../types';

// Test data: simple math BNF model with left recursion
const leftRecursiveMathModel: BNFModel = {
  name: 'LeftRecursiveMath',
  version: '1.0.0',
  start: 'Expression',
  nodes: {
    Number: {
      type: 'token',
      description: 'A numeric literal',
      pattern: { regex: '\\d+' }
    },
    Identifier: {
      type: 'token',
      description: 'A variable identifier',
      pattern: { regex: '[a-zA-Z_][a-zA-Z0-9_]*' }
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
    },
    LeftParen: {
      type: 'token',
      description: 'Left parenthesis',
      pattern: '('
    },
    RightParen: {
      type: 'token',
      description: 'Right parenthesis',
      pattern: ')'
    },
    Term: {
      type: 'union',
      description: 'A basic term in an expression',
      members: ['Number', 'Identifier', 'ParenExpression']
    },
    Operator: {
      type: 'union',
      description: 'Arithmetic operators',
      members: ['Plus', 'Minus']
    },
    BinaryExpression: {
      type: 'deduction',
      description: 'Binary arithmetic expression',
      sequence: [
        { node: 'Expression', prop: 'left' },
        { node: 'Operator', prop: 'operator' },
        { node: 'Expression', prop: 'right' }
      ],
      precedence: 1,
      associativity: 'left'
    },
    ParenExpression: {
      type: 'deduction',
      description: 'Parenthesized expression',
      sequence: [
        'LeftParen',
        { node: 'Expression', prop: 'expression' },
        'RightParen'
      ]
    },
    Expression: {
      type: 'union',
      description: 'Any valid expression',
      members: ['Term', 'BinaryExpression']
    }
  }
};

// Test data: simple non-left-recursive BNF model
const simpleMathModel: BNFModel = {
  name: 'SimpleMath',
  version: '1.0.0',
  start: 'Program',
  nodes: {
    Number: {
      type: 'token',
      description: 'A numeric literal',
      pattern: { regex: '\\d+' }
    },
    Identifier: {
      type: 'token',
      description: 'A variable identifier',
      pattern: { regex: '[a-zA-Z_][a-zA-Z0-9_]*' }
    },
    Plus: {
      type: 'token',
      description: 'Addition operator',
      pattern: '+'
    },
    Factor: {
      type: 'union',
      description: 'A basic factor',
      members: ['Number', 'Identifier']
    },
    Program: {
      type: 'deduction',
      description: 'A simple program',
      sequence: [
        { node: 'Factor', prop: 'left' },
        'Plus',
        { node: 'Factor', prop: 'right' }
      ]
    }
  }
};

describe('PegGenerator', () => {
  describe('Basic functionality', () => {
    it('should create a generator instance', () => {
      const generator = new PegGenerator();
      expect(generator).toBeDefined();
    });

    it('should generate PEG.js grammar', () => {
      const result = generatePegGrammar(simpleMathModel);

      expect(result.grammar).toBeTruthy();
      expect(typeof result.grammar).toBe('string');
      expect(result.warnings).toBeArray();
      expect(result.stats).toBeDefined();
    });

    it('should include header comment', () => {
      const result = generatePegGrammar(simpleMathModel);

      expect(result.grammar).toInclude('Generated PEG.js grammar for SimpleMath');
      expect(result.grammar).toInclude('Version: 1.0.0');
    });

    it('should include whitespace rules by default', () => {
      const result = generatePegGrammar(simpleMathModel);

      expect(result.grammar).toInclude('_ "whitespace"');
      expect(result.grammar).toInclude('__ "required whitespace"');
    });

    it('should exclude whitespace rules when disabled', () => {
      const result = generatePegGrammar(simpleMathModel, { includeWhitespace: false });

      expect(result.grammar).not.toInclude('_ "whitespace"');
    });
  });

  describe('Token rule generation', () => {
    it('should generate string literal token rules', () => {
      const result = generatePegGrammar(simpleMathModel);

      expect(result.grammar).toInclude('Plus "Addition operator"');
      expect(result.grammar).toInclude('"+"');
    });

    it('should generate regex pattern token rules', () => {
      const result = generatePegGrammar(simpleMathModel);

      expect(result.grammar).toInclude('Number "A numeric literal"');
      expect(result.grammar).toInclude('[0-9]+');
    });

    it('should handle identifier patterns', () => {
      const result = generatePegGrammar(simpleMathModel);

      expect(result.grammar).toInclude('Identifier "A variable identifier"');
      expect(result.grammar).toInclude('[a-zA-Z_][a-zA-Z0-9_]*');
    });
  });

  describe('Deduction rule generation', () => {
    it('should generate sequence rules with property assignments', () => {
      const result = generatePegGrammar(leftRecursiveMathModel);

      expect(result.grammar).toInclude('BinaryExpression "Binary arithmetic expression"');
      expect(result.grammar).toInclude('left:Expression _ operator:Operator _ right:Expression');
    });

    it('should generate sequence rules with direct token references', () => {
      const result = generatePegGrammar(leftRecursiveMathModel);

      expect(result.grammar).toInclude('ParenExpression "Parenthesized expression"');
      expect(result.grammar).toInclude('LeftParen _ expression:Expression _ RightParen');
    });
  });

  describe('Union rule generation', () => {
    it('should generate choice rules', () => {
      const result = generatePegGrammar(leftRecursiveMathModel);

      expect(result.grammar).toInclude('Term "A basic term in an expression"');
      expect(result.grammar).toInclude('Number / Identifier / ParenExpression');

      expect(result.grammar).toInclude('Expression "Any valid expression"');
      expect(result.grammar).toInclude('Term / BinaryExpression');
    });
  });

  describe('Statistics', () => {
    it('should provide correct statistics', () => {
      const result = generatePegGrammar(leftRecursiveMathModel);

      expect(result.stats.totalRules).toBe(11);
      expect(result.stats.tokenRules).toBe(6); // Number, Identifier, Plus, Minus, LeftParen, RightParen
      expect(result.stats.deductionRules).toBe(2); // BinaryExpression, ParenExpression
      expect(result.stats.unionRules).toBe(3); // Term, Operator, Expression
      expect(result.stats.listRules).toBe(0); // No list rules in this model
    });
  });

  describe('Left recursion detection', () => {
    it('should detect and warn about left recursion', () => {
      const leftRecursiveModel: BNFModel = {
        name: 'LeftRecursive',
        version: '1.0.0',
        start: 'A',
        nodes: {
          A: {
            type: 'deduction',
            description: 'Left recursive rule',
            sequence: [
              { node: 'A', prop: 'left' },
              'Plus',
              { node: 'B', prop: 'right' }
            ]
          },
          B: {
            type: 'token',
            description: 'Terminal',
            pattern: 'b'
          },
          Plus: {
            type: 'token',
            description: 'Plus',
            pattern: '+'
          }
        }
      };

      const result = generatePegGrammar(leftRecursiveModel);

      expect(result.warnings).toEqual(expect.arrayContaining([
        expect.stringContaining('Left recursion detected in rules: A')
      ]));
      expect(result.stats.leftRecursiveRules).toContain('A');
    });
  });

  describe('Configuration options', () => {
    it('should respect includeLocation option', () => {
      const result = generatePegGrammar(simpleMathModel, { includeLocation: false });

      expect(result.grammar).not.toInclude('range: location()');
    });

    it('should respect includeDebugInfo option', () => {
      const result = generatePegGrammar(simpleMathModel, { includeDebugInfo: true });

      // Debug info would be implementation specific
      expect(result.grammar).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    it('should throw error for missing start rule', () => {
      const invalidModel = {
        ...simpleMathModel,
        start: 'NonExistentRule'
      };

      expect(() => generatePegGrammar(invalidModel))
        .toThrow(PegGenerationError);
    });

    it('should handle empty models gracefully', () => {
      const emptyModel: BNFModel = {
        name: 'Empty',
        version: '1.0.0',
        start: 'Start',
        nodes: {
          Start: {
            type: 'token',
            description: 'Empty start',
            pattern: ''
          }
        }
      };

      expect(() => generatePegGrammar(emptyModel))
        .not.toThrow();
    });
  });

  describe('Complex patterns', () => {
    it('should warn about problematic regex patterns', () => {
      const problematicModel: BNFModel = {
        name: 'Problematic',
        version: '1.0.0',
        start: 'VeryLongPattern',
        nodes: {
          WhitespacePattern: {
            type: 'token',
            description: 'Pattern with problematic whitespace',
            pattern: { regex: 'test\\s+pattern' } // Uses \s which may conflict with PEG.js
          },
          VeryLongPattern: {
            type: 'token',
            description: 'Very long pattern',
            pattern: { regex: 'a'.repeat(250) } // Over 200 characters
          }
        }
      };

      const result = generatePegGrammar(problematicModel);

      expect(result.warnings).toEqual(expect.arrayContaining([
        expect.stringContaining('uses \\s which may conflict with PEG.js'),
        expect.stringContaining('very long regex pattern')
      ]));
    });
  });

  describe('Convenience function', () => {
    it('should work with generatePegGrammar function', () => {
      const result = generatePegGrammar(simpleMathModel);

      expect(result).toEqual(expect.objectContaining({
        grammar: expect.any(String),
        warnings: expect.any(Array),
        stats: expect.objectContaining({
          totalRules: expect.any(Number),
          tokenRules: expect.any(Number),
          deductionRules: expect.any(Number),
          unionRules: expect.any(Number),
          leftRecursiveRules: expect.any(Array)
        })
      }));
    });
  });
});
