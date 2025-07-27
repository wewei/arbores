/**
 * Tests for BNF Code Generator
 */

import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { load as loadYaml } from 'js-yaml';
import { parseBNF } from '../bnf-parser.js';
import { BNFCodeGenerator, generateCode, type GenerationConfig } from '../schema-generator.js';
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

describe('BNF Code Generator', () => {
  describe('BNFCodeGenerator class', () => {
    it('should generate code for simple math grammar', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: GenerationConfig = {
        outputDir: './output',
        separateFiles: true,
        includeDocumentation: true,
      };

      const generator = new BNFCodeGenerator(parseResult.model, config);
      const result = generator.generate();

      expect(result.success).toBe(true);
      expect(result.errors?.length || 0).toBe(0);
      expect(result.files).toBeDefined();
      expect(result.files!.size).toBeGreaterThan(0);

      // Check that all expected files are generated
      const fileNames = Array.from(result.files!.keys());
      expect(fileNames).toContain('token-types.ts');
      expect(fileNames).toContain('union-types.ts');
      expect(fileNames).toContain('constants.ts');
      expect(fileNames).toContain('index.ts');

      // Check that deduction node files are generated
      expect(fileNames).toEqual(expect.arrayContaining([
        'nodes/BinaryExpression.ts',
        'nodes/ParenExpression.ts',
      ]));
    });

    it('should generate token types correctly', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: GenerationConfig = {
        outputDir: './output',
        includeDocumentation: false,
      };

      const generator = new BNFCodeGenerator(parseResult.model, config);
      const result = generator.generate();

      expect(result.success).toBe(true);

      const tokenTypes = result.files!.get('token-types.ts');
      expect(tokenTypes).toBeDefined();
      expect(tokenTypes).toContain('export interface IdentifierToken');
      expect(tokenTypes).toContain('export interface NumberToken');
      expect(tokenTypes).toContain('export interface PlusToken');
      expect(tokenTypes).toContain('export type SimpleMathToken');
      expect(tokenTypes).toContain('readonly type: \'Identifier\'');
      expect(tokenTypes).toContain('readonly value: string');
    });

    it('should generate union types correctly', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: GenerationConfig = {
        outputDir: './output',
      };

      const generator = new BNFCodeGenerator(parseResult.model, config);
      const result = generator.generate();

      expect(result.success).toBe(true);

      const unionTypes = result.files!.get('union-types.ts');
      expect(unionTypes).toBeDefined();
      expect(unionTypes).toContain('export type Term =');
      expect(unionTypes).toContain('export type Expression =');
      expect(unionTypes).toContain('export type Operator =');
      expect(unionTypes).toContain('IdentifierToken | NumberToken | ParenExpressionNode');
    });

    it('should generate deduction node interfaces correctly', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: GenerationConfig = {
        outputDir: './output',
        separateFiles: true,
      };

      const generator = new BNFCodeGenerator(parseResult.model, config);
      const result = generator.generate();

      expect(result.success).toBe(true);

      const binaryExpr = result.files!.get('nodes/BinaryExpression.ts');
      expect(binaryExpr).toBeDefined();
      expect(binaryExpr).toContain('export interface BinaryExpressionNode');
      expect(binaryExpr).toContain('readonly type: \'BinaryExpression\'');
      expect(binaryExpr).toContain('readonly left: Expression');
      expect(binaryExpr).toContain('readonly operator: Operator');
      expect(binaryExpr).toContain('readonly right: Expression');
    });

    it('should generate constants registry correctly', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: GenerationConfig = {
        outputDir: './output',
      };

      const generator = new BNFCodeGenerator(parseResult.model, config);
      const result = generator.generate();

      expect(result.success).toBe(true);

      const constants = result.files!.get('constants.ts');
      expect(constants).toBeDefined();
      expect(constants).toContain('export const TOKEN_PATTERNS');
      expect(constants).toContain('Identifier: { regex:');
      expect(constants).toContain('Plus: \'+\'');
      expect(constants).toContain('export const PRECEDENCE');
      expect(constants).toContain('BinaryExpression: 1');
      expect(constants).toContain('export const ASSOCIATIVITY');
      expect(constants).toContain('BinaryExpression: \'left\'');
    });

    it('should generate index file with proper exports', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: GenerationConfig = {
        outputDir: './output',
      };

      const generator = new BNFCodeGenerator(parseResult.model, config);
      const result = generator.generate();

      expect(result.success).toBe(true);

      const indexFile = result.files!.get('index.ts');
      expect(indexFile).toBeDefined();
      expect(indexFile).toContain('export * from \'./token-types.js\'');
      expect(indexFile).toContain('export * from \'./union-types.js\'');
      expect(indexFile).toContain('export * from \'./constants.js\'');

      // SimpleMathNode and SimpleMathRoot are now in union-types.ts
      const unionFile = result.files!.get('union-types.ts');
      expect(unionFile).toBeDefined();
      expect(unionFile).toContain('export type SimpleMathNode =');
      expect(unionFile).toContain('export type SimpleMathRoot =');
    });

    it('should handle custom naming configuration', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: GenerationConfig = {
        outputDir: './output',
        naming: {
          tokenSuffix: 'Tok',
          nodeSuffix: 'Def',
        },
      };

      const generator = new BNFCodeGenerator(parseResult.model, config);
      const result = generator.generate();

      expect(result.success).toBe(true);

      const tokenTypes = result.files!.get('token-types.ts');
      expect(tokenTypes).toContain('export interface IdentifierTok');
      expect(tokenTypes).toContain('export interface NumberTok');

      const binaryExpr = result.files!.get('nodes/BinaryExpression.ts');
      expect(binaryExpr).toContain('export interface BinaryExpressionDef');
    });

    it('should validate model before generation', () => {
      const invalidModel: BNFModel = {
        name: 'Invalid',
        version: '1.0.0',
        start: 'NonExistent',
        nodes: {},
      };

      const config: GenerationConfig = {
        outputDir: './output',
      };

      const generator = new BNFCodeGenerator(invalidModel, config);
      const result = generator.generate();

      expect(result.success).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([
        'BNF model must have at least one node',
        'BNF model start node must exist in nodes',
      ]));
    });

    it('should detect basic syntax errors in generated code', () => {
      // This test would require a more complex scenario to trigger syntax errors
      // For now, we'll test the validation mechanism works
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: GenerationConfig = {
        outputDir: './output',
      };

      const generator = new BNFCodeGenerator(parseResult.model, config);
      const result = generator.generate();

      expect(result.success).toBe(true);
      // If there were syntax errors, they would be in result.errors
      expect(result.errors?.length || 0).toBe(0);
    });
  });

  describe('generateCode convenience function', () => {
    it('should work as a convenience wrapper', () => {
      const input = loadFixture('simple-math.bnf.yaml');
      const parseResult = parseBNF(input);

      expect(parseResult.success).toBe(true);
      if (!parseResult.success) return;

      const config: GenerationConfig = {
        outputDir: './output',
      };

      const result = generateCode(parseResult.model, config);

      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
      expect(result.files!.size).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty union members gracefully', () => {
      const model: BNFModel = {
        name: 'TestGrammar',
        version: '1.0.0',
        start: 'EmptyUnion',
        nodes: {
          EmptyUnion: {
            type: 'union',
            description: 'Union with no members',
            members: [],
          },
        },
      };

      const config: GenerationConfig = {
        outputDir: './output',
      };

      const result = generateCode(model, config);

      // Should generate but with warnings
      expect(result.success).toBe(true);
      expect(result.warnings).toEqual(expect.arrayContaining([
        'No token nodes found in BNF model',
        'No deduction nodes found in BNF model',
      ]));
    });

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

      const config: GenerationConfig = {
        outputDir: './output',
      };

      const result = generateCode(model, config);

      expect(result.success).toBe(true);
      expect(result.files!.has('token-types.ts')).toBe(true);
      expect(result.warnings).toEqual(expect.arrayContaining([
        'No union nodes found in BNF model',
        'No deduction nodes found in BNF model',
      ]));
    });
  });
});
