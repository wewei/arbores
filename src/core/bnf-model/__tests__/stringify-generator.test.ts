/**
 * Tests for BNF Stringify Generator
 */

import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { load as loadYaml } from 'js-yaml';
import { parseBNF } from '../bnf-parser.js';
import { StringifyGenerator, generateStringifyFunctions, type StringifyConfig } from '../stringify-generator.js';
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

describe('BNF Stringify Generator', () => {
  describe('StringifyGenerator class', () => {
    it('should generate stringify functions for simple math grammar', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: StringifyConfig = {
        functionPrefix: 'stringify',
        indentStyle: '  ',
        includeWhitespace: true,
        includeFormatting: true,
      };

      const generator = new StringifyGenerator(parseResult.model, config);
      const result = generator.generate();

      expect(result.success).toBe(true);
      expect(result.errors?.length || 0).toBe(0);
      expect(result.code).toBeDefined();
      expect(result.types).toBeDefined();

      // Check that main function is generated
      expect(result.code).toContain('export function stringifySimpleMath');
      expect(result.code).toContain('function stringifyNode');

      // Check that specific node functions are generated
      expect(result.code).toContain('function stringifyIdentifier');
      expect(result.code).toContain('function stringifyBinaryExpression');
      expect(result.code).toContain('function stringifyExpression');
    });

    it('should generate token stringify functions correctly', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const generator = new StringifyGenerator(parseResult.model);
      const result = generator.generate();

      expect(result.success).toBe(true);
      expect(result.code).toContain('function stringifyIdentifier(node: IdentifierToken');
      expect(result.code).toContain('return node.value;');
      expect(result.code).toContain('function stringifyPlus(node: PlusToken');
      expect(result.code).toContain('* Stringify Identifier token');
    });

    it('should generate deduction stringify functions correctly', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const generator = new StringifyGenerator(parseResult.model);
      const result = generator.generate();

      expect(result.success).toBe(true);
      expect(result.code).toContain('function stringifyBinaryExpression(node: BinaryExpressionNode');
      expect(result.code).toContain('const parts: string[] = [];');
      expect(result.code).toContain('parts.push(stringifyNode(node.');
      expect(result.code).toContain('return parts.join(\'\');');
    });

    it('should generate union stringify functions correctly', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const generator = new StringifyGenerator(parseResult.model);
      const result = generator.generate();

      expect(result.success).toBe(true);
      expect(result.code).toContain('function stringifyExpression(node: Expression');
      expect(result.code).toContain('return stringifyNode(node, options);');
      expect(result.code).toContain('* Stringify Expression union node');
    });

    it('should generate main dispatch function with switch cases', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const generator = new StringifyGenerator(parseResult.model);
      const result = generator.generate();

      expect(result.success).toBe(true);
      expect(result.code).toContain('switch (node.type) {');
      expect(result.code).toContain('case \'Identifier\':');
      expect(result.code).toContain('return stringifyIdentifier(node, options);');
      expect(result.code).toContain('case \'BinaryExpression\':');
      expect(result.code).toContain('default:');
      expect(result.code).toContain('throw new Error(`Unknown node type: ${node.type}`);');
    });

    it('should generate utility functions', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const generator = new StringifyGenerator(parseResult.model);
      const result = generator.generate();

      expect(result.success).toBe(true);
      expect(result.code).toContain('function getIndentation(options: StringifyOptions)');
      expect(result.code).toContain('function addWhitespace(parts: string[]');
      expect(result.code).toContain('function formatToken(value: string');
      expect(result.code).toContain('indentStr.repeat(level)');
    });

    it('should generate TypeScript type definitions', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const generator = new StringifyGenerator(parseResult.model);
      const result = generator.generate();

      expect(result.success).toBe(true);
      expect(result.types).toContain('export interface StringifyOptions');
      expect(result.types).toContain('indent?: number;');
      expect(result.types).toContain('includeWhitespace?: boolean;');
      expect(result.types).toContain('export type StringifySimpleMathFunction');
      expect(result.types).toContain('export declare const stringifySimpleMath');
    });

    it('should handle custom configuration', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: StringifyConfig = {
        functionPrefix: 'render',
        indentStyle: '\t',
        includeWhitespace: false,
        includeFormatting: false,
      };

      const generator = new StringifyGenerator(parseResult.model, config);
      const result = generator.generate();

      expect(result.success).toBe(true);
      expect(result.code).toContain('export function renderSimpleMath');
      expect(result.code).toContain('function renderNode');
      expect(result.code).toContain('function renderIdentifier');
      expect(result.code).toContain('indentString: \'\t\'');
      expect(result.code).toContain('includeWhitespace: false');
      expect(result.code).toContain('format: false');
    });

    it('should handle custom type mappings', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: StringifyConfig = {
        typeMapping: {
          'Identifier': 'CustomIdentifierType',
          'BinaryExpression': 'CustomBinaryExprType',
        },
      };

      const generator = new StringifyGenerator(parseResult.model, config);
      const result = generator.generate();

      expect(result.success).toBe(true);
      expect(result.code).toContain('function stringifyIdentifier(node: CustomIdentifierType');
      expect(result.code).toContain('function stringifyBinaryExpression(node: CustomBinaryExprType');
    });

    it('should validate model before generation', () => {
      const invalidModel: BNFModel = {
        name: 'Invalid',
        version: '1.0.0',
        start: 'NonExistent',
        nodes: {},
      };

      const generator = new StringifyGenerator(invalidModel);
      const result = generator.generate();

      expect(result.success).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([
        'BNF model must have at least one node',
        'BNF model start node must exist in nodes',
      ]));
    });

    it('should handle sequence stringification with properties', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const generator = new StringifyGenerator(parseResult.model);
      const result = generator.generate();

      expect(result.success).toBe(true);

      // Check that BinaryExpression function handles properties correctly
      const binaryExprFunction = result.code?.match(
        /function stringifyBinaryExpression[\s\S]*?^}/m
      )?.[0];

      expect(binaryExprFunction).toContain('// Property: left');
      expect(binaryExprFunction).toContain('if (node.left)');
      expect(binaryExprFunction).toContain('parts.push(stringifyNode(node.left, options));');
      expect(binaryExprFunction).toContain('// Property: operator');
      expect(binaryExprFunction).toContain('// Property: right');
    });

    it('should include proper file header and imports', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const generator = new StringifyGenerator(parseResult.model);
      const result = generator.generate();

      expect(result.success).toBe(true);
      expect(result.code).toContain('* Stringify functions for SimpleMath grammar');
      expect(result.code).toContain('* Generated from BNF model: SimpleMath v1.0.0');
      expect(result.code).toContain('* @fileoverview This file is auto-generated. Do not edit manually.');
      expect(result.code).toContain('import type {');
      expect(result.code).toContain('} from \'./index.js\';');
    });
  });

  describe('generateStringifyFunctions convenience function', () => {
    it('should work as a convenience wrapper', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const result = generateStringifyFunctions(parseResult.model);

      expect(result.success).toBe(true);
      expect(result.code).toBeDefined();
      expect(result.types).toBeDefined();
      expect(result.code).toContain('export function stringifySimpleMath');
    });

    it('should accept custom configuration', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: StringifyConfig = {
        functionPrefix: 'print',
        indentStyle: '    ',
      };

      const result = generateStringifyFunctions(parseResult.model, config);

      expect(result.success).toBe(true);
      expect(result.code).toContain('export function printSimpleMath');
      expect(result.code).toContain('indentString: \'    \'');
    });
  });

  describe('edge cases', () => {
    it('should handle models with only tokens', () => {
      const model: BNFModel = {
        name: 'TokenOnly',
        version: '1.0.0',
        start: 'OnlyToken',
        nodes: {
          OnlyToken: {
            type: 'token',
            description: 'A single token',
            pattern: 'test',
          },
        },
      };

      const result = generateStringifyFunctions(model);

      expect(result.success).toBe(true);
      expect(result.code).toContain('function stringifyOnlyToken(node: OnlyTokenToken');
      expect(result.code).toContain('return node.value;');
    });

    it('should handle models with only unions', () => {
      const model: BNFModel = {
        name: 'UnionOnly',
        version: '1.0.0',
        start: 'MainUnion',
        nodes: {
          TokenA: {
            type: 'token',
            description: 'Token A',
            pattern: 'a',
          },
          TokenB: {
            type: 'token',
            description: 'Token B',
            pattern: 'b',
          },
          MainUnion: {
            type: 'union',
            description: 'Union of tokens',
            members: ['TokenA', 'TokenB'],
          },
        },
      };

      const result = generateStringifyFunctions(model);

      expect(result.success).toBe(true);
      expect(result.code).toContain('function stringifyMainUnion(node: MainUnion');
      expect(result.code).toContain('return stringifyNode(node, options);');
    });

    it('should handle generation errors gracefully', () => {
      // Create a model with an unknown node type (this would be caught during validation)
      const model = {
        name: 'ErrorTest',
        version: '1.0.0',
        start: 'BadNode',
        nodes: {
          BadNode: {
            type: 'invalid' as any,
            description: 'Invalid node type',
            pattern: 'test', // Add required properties to make it type-compatible
          },
        },
      } as unknown as BNFModel;

      const generator = new StringifyGenerator(model);
      const result = generator.generate();

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
});
