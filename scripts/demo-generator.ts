#!/usr/bin/env bun

/**
 * Demo script for BNF Code Generator
 * 
 * This script demonstrates the code generation capabilities by:
 * 1. Loading the simple-math BNF model
 * 2. Generating TypeScript code
 * 3. Displaying the generated files
 * 4. Validating the generated code
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { load as loadYaml } from 'js-yaml';
import { parseBNF } from '../src/core/bnf-model/bnf-parser.js';
import { generateCode, type GenerationConfig } from '../src/core/bnf-model/schema-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function main() {
  console.log('🚀 BNF Code Generator Demo\n');

  // Load the simple-math fixture
  const fixturePath = join(__dirname, '../src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml');
  const yamlContent = readFileSync(fixturePath, 'utf-8');
  const input = loadYaml(yamlContent) as any;

  console.log('📖 Loaded BNF model:', input.name, 'v' + input.version);
  console.log('📝 Description:', input.metadata?.description);
  console.log('🎯 Start node:', input.start);
  console.log('📊 Total nodes:', Object.keys(input.nodes).length);
  console.log('');

  // Parse the BNF model
  const parseResult = parseBNF(input);
  if (!parseResult.success) {
    console.error('❌ Failed to parse BNF model:', parseResult.errors);
    process.exit(1);
  }

  console.log('✅ BNF model parsed successfully\n');

  // Generate TypeScript code
  const config: GenerationConfig = {
    outputDir: './generated',
    separateFiles: true,
    includeDocumentation: true,
  };

  console.log('⚙️ Generation configuration:');
  console.log('  📁 Output dir:', config.outputDir);
  console.log('  📄 Separate files:', config.separateFiles);
  console.log('  📝 Documentation:', config.includeDocumentation);
  console.log('');

  const result = generateCode(parseResult.model, config);

  if (!result.success) {
    console.error('❌ Code generation failed:');
    result.errors?.forEach(error => console.error('  •', error));
    process.exit(1);
  }

  console.log('✅ Code generation successful!');
  console.log('📁 Generated', result.files!.size, 'files');

  if (result.warnings && result.warnings.length > 0) {
    console.log('⚠️ Warnings:');
    result.warnings.forEach(warning => console.log('  •', warning));
  }
  console.log('');

  // Display generated files
  console.log('📋 Generated Files:\n');

  const fileOrder = ['index.ts', 'token-types.ts', 'union-types.ts', 'constants.ts'];
  const nodeFiles: string[] = [];

  // Display main files first
  for (const fileName of fileOrder) {
    if (result.files!.has(fileName)) {
      displayFile(fileName, result.files!.get(fileName)!);
    }
  }

  // Display node files
  for (const [fileName, content] of result.files!) {
    if (fileName.startsWith('nodes/')) {
      nodeFiles.push(fileName);
    }
  }

  nodeFiles.sort();
  for (const fileName of nodeFiles) {
    displayFile(fileName, result.files!.get(fileName)!);
  }

  console.log('🎯 Generation Summary:');
  console.log('  📊 Token types:', getCount(result.files!, 'Token {'));
  console.log('  🔗 Union types:', getCount(result.files!, 'export type'));
  console.log('  🏗️ Node interfaces:', getCount(result.files!, 'Node {'));
  console.log('  📋 Constants:', getCount(result.files!, 'export const'));
  console.log('');

  console.log('✨ Demo completed successfully!');
  console.log('💡 The generated code is ready for use in TypeScript projects.');
}

function displayFile(fileName: string, content: string): void {
  console.log(`📄 ${fileName}`);
  console.log('─'.repeat(50));

  // Show first 20 lines of the file
  const lines = content.split('\n');
  const displayLines = lines.slice(0, 20);

  displayLines.forEach((line, index) => {
    const lineNum = (index + 1).toString().padStart(2, ' ');
    console.log(`${lineNum} │ ${line}`);
  });

  if (lines.length > 20) {
    console.log(`   │ ... (${lines.length - 20} more lines)`);
  }

  console.log('');
}

function getCount(files: Map<string, string>, pattern: string): number {
  let count = 0;
  for (const content of files.values()) {
    const matches = content.match(new RegExp(pattern, 'g'));
    count += matches ? matches.length : 0;
  }
  return count;
}

// Run the demo
if (import.meta.main) {
  main();
}
