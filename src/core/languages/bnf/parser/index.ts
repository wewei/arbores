/**
 * Parser for BNFGrammar v1.0.0
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T07:58:08.217Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parser statistics
export const PARSER_STATS = {
  "totalRules": 32,
  "tokenRules": 13,
  "deductionRules": 17,
  "unionRules": 2,
  "leftRecursiveRules": []
} as const;

/**
 * Load the PEG.js grammar
 */
function loadGrammar(): string {
  const grammarPath = join(__dirname, 'bnfgrammar.syntax.pegjs');
  return readFileSync(grammarPath, 'utf-8');
}

/**
 * Parse input text using the generated PEG.js grammar
 * 
 * Note: This requires PEG.js to be installed and the grammar to be compiled.
 * You need to compile the grammar first using:
 * npx pegjs --output bnfgrammar-parser.js bnfgrammar.syntax.pegjs
 * 
 * @param input - The input text to parse
 * @returns The parsed AST
 */
export function parse(input: string): any {
  throw new Error('Parser not compiled. Please compile the PEG.js grammar first.');
}

/**
 * Get the raw PEG.js grammar string
 */
export function getGrammar(): string {
  return loadGrammar();
}

/**
 * Get parser statistics
 */
export function getStats() {
  return PARSER_STATS;
}
