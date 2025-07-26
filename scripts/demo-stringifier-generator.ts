#!/usr/bin/env bun
/**
 * Demo script for BNF stringifier generator
 * Shows how to generate stringifier functions and test round-trip conversion
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { load as loadYaml } from 'js-yaml';
import { parseBNF } from '../src/core/bnf-model/bnf-parser.js';
import { generateStringifierFunctions } from '../src/core/bnf-model/stringifier-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the simple math grammar
const mathGrammarPath = join(__dirname, '../src/core/bnf-model/__tests__/fixtures/simple-math.bnf.yaml');
const grammarContent = readFileSync(mathGrammarPath, 'utf-8');
const grammarModel = loadYaml(grammarContent) as any;

console.log('🎯 BNF stringifier Generator Demo');
console.log('='.repeat(50));

console.log('\n1. Loading BNF grammar model...');
console.log(`   Model name: ${grammarModel.name}`);
console.log(`   Version: ${grammarModel.version}`);
console.log(`   Start rule: ${grammarModel.start}`);
console.log(`   Nodes: ${Object.keys(grammarModel.nodes).length}`);

console.log('\n2. Parsing BNF model...');
const parseResult = parseBNF(grammarModel);

if (!parseResult.success) {
  console.error('❌ Failed to parse BNF model:');
  parseResult.errors?.forEach(error => console.error(`   - ${error}`));
  process.exit(1);
}

console.log('✅ BNF model parsed successfully');

console.log('\n3. Generating stringifier functions...');
const stringifierResult = generateStringifierFunctions(parseResult.model, {
  functionPrefix: 'stringifier',
  indentStyle: '  ',
  includeWhitespace: true,
  includeFormatting: true,
});

if (!stringifierResult.success) {
  console.error('❌ Failed to generate stringifier functions:');
  stringifierResult.errors?.forEach((error: any) => console.error(`   - ${error}`));
  process.exit(1);
}

console.log('✅ stringifier functions generated successfully');
console.log(`   Generated code: ${stringifierResult.code?.length || 0} chars`);
console.log(`   Generated types: ${stringifierResult.types?.length || 0} chars`);

// Save generated files
const outputDir = join(__dirname, '../temp');
console.log('\n4. Saving generated files...');

try {
  // Ensure output directory exists
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch (e) {
    // Directory already exists
  }

  const codeFile = join(outputDir, 'stringifier-simple-math.ts');
  const typesFile = join(outputDir, 'stringifier-simple-math.d.ts');

  writeFileSync(codeFile, stringifierResult.code || '');
  writeFileSync(typesFile, stringifierResult.types || '');

  console.log(`✅ Code saved to: ${codeFile}`);
  console.log(`✅ Types saved to: ${typesFile}`);
} catch (error) {
  console.error('❌ Failed to save files:', error);
  process.exit(1);
}

console.log('\n5. Analyzing generated stringifier functions...');

// Extract function names from generated code
const functionMatches = stringifierResult.code?.match(/function (stringifier\w+)/g) || [];
const functionNames = functionMatches.map((match: any) => match.replace('function ', ''));

console.log(`   Functions generated: ${functionNames.length}`);
functionNames.forEach((name: any) => console.log(`   - ${name}`));

// Show sample token function
console.log('\n6. Sample Token stringifier Function:');
const identifierFunction = stringifierResult.code?.match(
  /\/\*\*[\s\S]*?\*\/\s*function stringifierIdentifier[\s\S]*?^}/m
)?.[0];

if (identifierFunction) {
  console.log('```typescript');
  console.log(identifierFunction.split('\n').slice(0, 8).join('\n') + '\n  // ... rest of function');
  console.log('```');
}

// Show sample deduction function
console.log('\n7. Sample Deduction stringifier Function:');
const binaryExprFunction = stringifierResult.code?.match(
  /\/\*\*[\s\S]*?\*\/\s*function stringifierBinaryExpression[\s\S]*?^}/m
)?.[0];

if (binaryExprFunction) {
  console.log('```typescript');
  console.log(binaryExprFunction.split('\n').slice(0, 12).join('\n') + '\n  // ... rest of function');
  console.log('```');
}

console.log('\n8. Configuration Analysis:');
console.log('   Default options used:');
console.log('   - Function prefix: "stringifier"');
console.log('   - Indent style: "  " (2 spaces)');
console.log('   - Include whitespace: true');
console.log('   - Include formatting: true');

console.log('\n🎉 Demo completed successfully!');
console.log('\nNext steps:');
console.log('1. Import the generated stringifier functions in your project');
console.log('2. Use them to convert AST nodes back to source code');
console.log('3. Test round-trip conversion (parse → stringifier → parse)');
console.log('4. Customize formatting options as needed');
