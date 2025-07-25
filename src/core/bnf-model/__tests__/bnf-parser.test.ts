/**
 * Tests for BNF Model Parser
 */

import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { load as loadYaml } from 'js-yaml';
import { parseBNF, findUnreachableNodes } from '../bnf-parser.js';
import type { BNFModel } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadFixture = (filename: string): any => {
  const path = join(__dirname, 'fixtures', filename);
  const content = readFileSync(path, 'utf-8');

  if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
    return loadYaml(content);
  } else if (filename.endsWith('.json')) {
    return JSON.parse(content);
  } else {
    throw new Error(`Unsupported fixture format: ${filename}`);
  }
};

describe('BNF Parser', () => {
  describe('parseBNF', () => {
    it('should parse a valid BNF model', () => {
      const input = {
        name: 'TestGrammar',
        version: '1.0.0',
        start: 'Expression',
        nodes: {
          Identifier: {
            type: 'token',
            description: 'An identifier token',
            pattern: { regex: '[a-zA-Z_][a-zA-Z0-9_]*' }
          },
          Plus: {
            type: 'token',
            description: 'Plus operator',
            pattern: '+'
          },
          Expression: {
            type: 'deduction',
            description: 'Binary addition expression',
            sequence: [
              { node: 'Identifier', prop: 'left' },
              'Plus',
              { node: 'Identifier', prop: 'right' }
            ]
          }
        }
      };

      const result = parseBNF(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.model.name).toBe('TestGrammar');
        expect(result.model.version).toBe('1.0.0');
        expect(result.model.start).toBe('Expression');
        expect(Object.keys(result.model.nodes)).toHaveLength(3);
      }
    });

    it('should reject invalid input types', () => {
      const result = parseBNF(null);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain('Input must be an object');
      }
    });

    it('should reject missing required fields', () => {
      const result = parseBNF({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toEqual(expect.arrayContaining([
          'Model must have a valid name (non-empty string)',
          'Model must have a valid version (non-empty string)',
          'Model must have a valid start node name (non-empty string)',
          'Model must have a nodes object'
        ]));
      }
    });

    it('should validate token node patterns', () => {
      const input = {
        name: 'Test',
        version: '1.0.0',
        start: 'BadToken',
        nodes: {
          BadToken: {
            type: 'token',
            description: 'Invalid token',
            pattern: { regex: '[invalid regex' } // Invalid regex
          }
        }
      };

      const result = parseBNF(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]).toContain('invalid regex pattern');
      }
    });

    it('should validate deduction node sequences', () => {
      const input = {
        name: 'Test',
        version: '1.0.0',
        start: 'Expression',
        nodes: {
          Expression: {
            type: 'deduction',
            description: 'Expression with invalid reference',
            sequence: [
              { node: 'NonExistent', prop: 'value' } // Non-existent node
            ]
          }
        }
      };

      const result = parseBNF(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]).toContain('referenced node "NonExistent" does not exist');
      }
    });

    it('should validate union node members', () => {
      const input = {
        name: 'Test',
        version: '1.0.0',
        start: 'Union',
        nodes: {
          Union: {
            type: 'union',
            description: 'Union with invalid members',
            members: ['NonExistent1', 'NonExistent2']
          }
        }
      };

      const result = parseBNF(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toEqual(expect.arrayContaining([
          'Union node "Union" member "NonExistent1" does not exist',
          'Union node "Union" member "NonExistent2" does not exist'
        ]));
      }
    });

    it('should validate token node string references', () => {
      const input = {
        name: 'Test',
        version: '1.0.0',
        start: 'Expression',
        nodes: {
          RegexToken: {
            type: 'token',
            description: 'Regex token',
            pattern: { regex: '[a-z]+' }
          },
          Expression: {
            type: 'deduction',
            description: 'Expression with invalid string reference',
            sequence: ['RegexToken'] // String reference to regex token
          }
        }
      };

      const result = parseBNF(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]).toContain('string reference "RegexToken" must point to a TokenNode with string pattern');
      }
    });

    it('should validate property names in camelCase', () => {
      const input = {
        name: 'Test',
        version: '1.0.0',
        start: 'Expression',
        nodes: {
          Identifier: {
            type: 'token',
            description: 'Identifier',
            pattern: { regex: '[a-z]+' }
          },
          Expression: {
            type: 'deduction',
            description: 'Expression',
            sequence: [
              { node: 'Identifier', prop: 'Invalid_Name' } // Invalid camelCase
            ]
          }
        }
      };

      const result = parseBNF(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]).toContain('property name "Invalid_Name" is not valid camelCase');
      }
    });
  });

  describe('findUnreachableNodes', () => {
    it('should find unreachable nodes', () => {
      const model: BNFModel = {
        name: 'Test',
        version: '1.0.0',
        start: 'A',
        nodes: {
          A: {
            type: 'token',
            description: 'Start node',
            pattern: 'a'
          },
          B: {
            type: 'token',
            description: 'Unreachable node',
            pattern: 'b'
          }
        }
      };

      const unreachable = findUnreachableNodes(model);
      expect(unreachable).toEqual(['B']);
    });

    it('should return empty array when all nodes are reachable', () => {
      const model: BNFModel = {
        name: 'Test',
        version: '1.0.0',
        start: 'Union',
        nodes: {
          A: {
            type: 'token',
            description: 'Token A',
            pattern: 'a'
          },
          B: {
            type: 'token',
            description: 'Token B',
            pattern: 'b'
          },
          Union: {
            type: 'union',
            description: 'Union of A and B',
            members: ['A', 'B']
          }
        }
      };

      const unreachable = findUnreachableNodes(model);
      expect(unreachable).toEqual([]);
    });
  });

  describe('fixture-based tests', () => {
    it('should parse simple-math.bnf.yaml correctly', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const result = parseBNF(input);

      if (!result.success) {
        console.log('YAML parsing errors:', result.errors);
      }

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.model.name).toBe('SimpleMath');
        expect(result.model.version).toBe('1.0.0');
        expect(result.model.start).toBe('Expression');

        // Verify all expected nodes exist
        const nodeNames = Object.keys(result.model.nodes);
        expect(nodeNames).toEqual(expect.arrayContaining([
          'Identifier', 'Number', 'Plus', 'Minus', 'LeftParen', 'RightParen',
          'Term', 'Operator', 'Expression', 'BinaryExpression', 'ParenExpression'
        ]));

        // Verify some specific node structures
        const binaryExpr = result.model.nodes['BinaryExpression'];
        const term = result.model.nodes['Term'];
        const identifier = result.model.nodes['Identifier'];

        expect(binaryExpr?.type).toBe('deduction');
        expect(term?.type).toBe('union');
        expect(identifier?.type).toBe('token');

        // Check metadata if present
        if ('metadata' in result.model) {
          expect((result.model as any).metadata).toBeDefined();
          expect((result.model as any).metadata?.language).toBe('SimpleMath');
        }
      }
    });

    it('should parse simple-math.bnf.json correctly (JSON version)', () => {
      const input = loadFixture('simple-math.bnf.json');
      const result = parseBNF(input);

      if (!result.success) {
        console.log('JSON parsing errors:', result.errors);
      }

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.model.name).toBe('SimpleMath');
        expect(Object.keys(result.model.nodes)).toHaveLength(11);
      }
    });

    it('should reject invalid regex patterns from fixture', () => {
      const input = loadFixture('invalid-regex.bnf.yaml');
      const result = parseBNF(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]).toContain('invalid regex pattern');
      }
    });

    it('should reject invalid property names from fixture', () => {
      const input = loadFixture('invalid-prop-names.bnf.yaml');
      const result = parseBNF(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]).toContain('property name "Invalid_Name" is not valid camelCase');
      }
    });
  });
});
