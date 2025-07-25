#!/usr/bin/env bun
/**
 * BNF Language Tools CLI
 * 
 * Unified command-line interface for BNF language generation tools.
 * Supports schema generation, stringifier generation, and parser generation.
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join, basename, extname } from 'path';
import { load as loadYaml } from 'js-yaml';
import chalk from 'chalk';

import { parseBNF } from '../src/core/bnf-model/bnf-parser.js';
import { generateCode, type GenerationConfig } from '../src/core/bnf-model/generator.js';
import { generateStringifierFunctions, type StringifierConfig } from '../src/core/bnf-model/stringifier-generator.js';
import { generatePegGrammar } from '../src/core/bnf-model/peg-generator.js';
import type { BNFModel } from '../src/core/bnf-model/types.js';

const program = new Command();

interface GlobalOptions {
  verbose?: boolean;
}

/**
 * Load BNF model from file (JSON or YAML)
 */
function loadBNFModel(filePath: string): any {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const ext = extname(filePath).toLowerCase();

    if (ext === '.yaml' || ext === '.yml') {
      return loadYaml(content);
    } else if (ext === '.json') {
      return JSON.parse(content);
    } else {
      throw new Error(`Unsupported file format: ${ext}. Only .json, .yaml, .yml are supported.`);
    }
  } catch (error: any) {
    throw new Error(`Failed to load BNF model from ${filePath}: ${error?.message || error}`);
  }
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get language directory path
 */
function getLanguageDir(languageName: string): string {
  return join('src', 'core', 'languages', languageName);
}

// Configure main program
program
  .name('bnf-lang')
  .description('BNF Language Tools - Generate schema, stringifier, and parser for BNF languages')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose output');

// Generate schema command
program
  .command('schema')
  .description('Generate TypeScript schema for a BNF language')
  .argument('<model-file>', 'Path to BNF model file (.json, .yaml, or .yml)')
  .argument('<language>', 'Language name (e.g., "bnf", "typescript", "python")')
  .option('--include-docs', 'Include JSDoc documentation in generated code')
  .action(async (modelFile: string, language: string, options: {
    includeDocs?: boolean;
  }, command: any) => {
    try {
      const globalOptions = command.parent.opts() as GlobalOptions;
      const verbose = globalOptions.verbose;

      if (verbose) {
        console.error(chalk.blue(`🔍 Loading BNF model from: ${modelFile}`));
      }

      const modelData = loadBNFModel(modelFile);
      const parseResult = parseBNF(modelData);

      if (!parseResult.success) {
        console.error(chalk.red('❌ BNF model validation failed:'));
        parseResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      if (verbose) {
        console.error(chalk.blue('🏗️  Generating TypeScript schema...'));
      }

      const outputDir = getLanguageDir(language);
      ensureDir(outputDir);

      const config: GenerationConfig = {
        outputDir,
        separateFiles: true,
        includeDocumentation: options.includeDocs || false,
      };

      const generationResult = generateCode(parseResult.model, config);

      if (!generationResult.success) {
        console.error(chalk.red('❌ Code generation failed:'));
        generationResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      // Write generated files
      if (generationResult.files) {
        for (const [filePath, content] of generationResult.files) {
          const fullPath = join(outputDir, filePath);
          const dir = dirname(fullPath);

          ensureDir(dir);
          writeFileSync(fullPath, content, 'utf-8');
          console.error(chalk.green(`✅ Generated: ${fullPath}`));
        }
      }

      if (verbose) {
        console.error(chalk.green('✅ Schema generation completed'));
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error?.message || error}`));
      process.exit(1);
    }
  });

// Generate stringifier command
program
  .command('stringifier')
  .description('Generate stringifier functions for a BNF language')
  .argument('<model-file>', 'Path to BNF model file (.json, .yaml, or .yml)')
  .argument('<language>', 'Language name (e.g., "bnf", "typescript", "python")')
  .requiredOption('-s, --schema-dir <dir>', 'Directory containing generated schema files')
  .option('--function-prefix <prefix>', 'Prefix for generated function names', 'stringifier')
  .option('--indent-style <style>', 'Indentation style for generated code', '  ')
  .option('--no-whitespace', 'Disable whitespace formatting in generated functions')
  .option('--no-formatting', 'Disable advanced formatting options')
  .action(async (modelFile: string, language: string, options: {
    schemaDir: string;
    functionPrefix?: string;
    indentStyle?: string;
    whitespace?: boolean;
    formatting?: boolean;
  }, command: any) => {
    try {
      const globalOptions = command.parent.opts() as GlobalOptions;
      const verbose = globalOptions.verbose;

      if (verbose) {
        console.error(chalk.blue(`🔍 Loading BNF model from: ${modelFile}`));
      }

      // Verify schema directory exists
      if (!existsSync(options.schemaDir)) {
        console.error(chalk.red(`❌ Schema directory not found: ${options.schemaDir}`));
        console.error(chalk.yellow(`💡 Run "bun bnf-lang schema ${modelFile} ${language}" first to generate schema`));
        process.exit(1);
      }

      const modelData = loadBNFModel(modelFile);
      const parseResult = parseBNF(modelData);

      if (!parseResult.success) {
        console.error(chalk.red('❌ BNF model validation failed:'));
        parseResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      if (verbose) {
        console.error(chalk.blue('🔧 Generating stringifier functions...'));
      }

      const outputDir = getLanguageDir(language);
      ensureDir(outputDir);

      const config: StringifierConfig = {
        functionPrefix: options.functionPrefix || 'stringifier',
        indentStyle: options.indentStyle || '  ',
        includeWhitespace: options.whitespace !== false,
        includeFormatting: options.formatting !== false,
      };

      const stringifyResult = generateStringifierFunctions(parseResult.model, config);

      if (!stringifyResult.success) {
        console.error(chalk.red('❌ Stringifier generation failed:'));
        stringifyResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      // Modify the generated code to use correct import path
      let code = stringifyResult.code || '';

      // Replace the import path to use relative path to schema directory
      const relativeSchemaPath = '.';  // Since we're generating in the same directory as schema
      code = code.replace(
        ` } from './index.js';`,
        ` } from '${relativeSchemaPath}/index.js';`
      );

      const outputPath = join(outputDir, 'stringifier.ts');
      writeFileSync(outputPath, code, 'utf-8');

      console.error(chalk.green(`✅ Stringifier generated: ${outputPath}`));
      console.error(chalk.blue(`📊 Functions generated for ${Object.keys(parseResult.model.nodes).length} node types`));

      if (stringifyResult.warnings?.length) {
        console.error(chalk.yellow('⚠️  Warnings:'));
        stringifyResult.warnings.forEach(warning => console.error(chalk.yellow(`  - ${warning}`)));
      }

      if (verbose) {
        console.error(chalk.green('✅ Stringifier generation completed'));
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error?.message || error}`));
      process.exit(1);
    }
  });

// Generate parser command
program
  .command('parser')
  .description('Generate PEG.js parser for a BNF language')
  .argument('<model-file>', 'Path to BNF model file (.json, .yaml, or .yml)')
  .argument('<language>', 'Language name (e.g., "bnf", "typescript", "python")')
  .requiredOption('-s, --schema-dir <dir>', 'Directory containing generated schema files')
  .option('--include-whitespace', 'Include whitespace handling in grammar', true)
  .option('--include-location', 'Include location info in parser output', true)
  .option('--include-debug', 'Include debug info in parser output', false)
  .action(async (modelFile: string, language: string, options: {
    schemaDir: string;
    includeWhitespace?: boolean;
    includeLocation?: boolean;
    includeDebug?: boolean;
  }, command: any) => {
    try {
      const globalOptions = command.parent.opts() as GlobalOptions;
      const verbose = globalOptions.verbose;

      if (verbose) {
        console.error(chalk.blue(`🔍 Loading BNF model from: ${modelFile}`));
      }

      // Verify schema directory exists
      if (!existsSync(options.schemaDir)) {
        console.error(chalk.red(`❌ Schema directory not found: ${options.schemaDir}`));
        console.error(chalk.yellow(`💡 Run "bun bnf-lang schema ${modelFile} ${language}" first to generate schema`));
        process.exit(1);
      }

      const modelData = loadBNFModel(modelFile);
      const parseResult = parseBNF(modelData);

      if (!parseResult.success) {
        console.error(chalk.red('❌ BNF model validation failed:'));
        parseResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      if (verbose) {
        console.error(chalk.blue('🔧 Generating PEG.js parser...'));
      }

      const outputDir = getLanguageDir(language);
      ensureDir(outputDir);

      const result = generatePegGrammar(parseResult.model, {
        includeWhitespace: options.includeWhitespace !== false,
        includeLocation: options.includeLocation !== false,
        includeDebugInfo: options.includeDebug || false
      });

      const grammarPath = join(outputDir, 'grammar.pegjs');
      writeFileSync(grammarPath, result.grammar, 'utf-8');

      console.error(chalk.green(`✅ PEG.js grammar generated: ${grammarPath}`));
      console.error(chalk.blue(`📊 Statistics:`));
      console.error(chalk.blue(`   - Total rules: ${result.stats.totalRules}`));
      console.error(chalk.blue(`   - Token rules: ${result.stats.tokenRules}`));
      console.error(chalk.blue(`   - Deduction rules: ${result.stats.deductionRules}`));
      console.error(chalk.blue(`   - Union rules: ${result.stats.unionRules}`));

      if (result.warnings.length > 0) {
        console.error(chalk.yellow(`⚠️  Warnings:`));
        result.warnings.forEach(warning => console.error(chalk.yellow(`   - ${warning}`)));
      }

      if (result.stats.leftRecursiveRules.length > 0) {
        console.error(chalk.blue(`🔄 Left recursive rules detected: ${result.stats.leftRecursiveRules.join(', ')}`));
      }

      // Write model info
      const modelInfoPath = join(outputDir, 'model-info.json');
      const modelInfo = {
        name: parseResult.model.name,
        version: parseResult.model.version,
        generatedAt: new Date().toISOString(),
        stats: result.stats,
        warnings: result.warnings
      };
      writeFileSync(modelInfoPath, JSON.stringify(modelInfo, null, 2), 'utf-8');
      console.error(chalk.green(`✅ Model info saved: ${modelInfoPath}`));

      if (verbose) {
        console.error(chalk.green('✅ Parser generation completed'));
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error?.message || error}`));
      process.exit(1);
    }
  });

// All-in-one command
program
  .command('generate')
  .description('Generate schema, stringifier, and parser for a BNF language')
  .argument('<model-file>', 'Path to BNF model file (.json, .yaml, or .yml)')
  .argument('<language>', 'Language name (e.g., "bnf", "typescript", "python")')
  .option('--include-docs', 'Include JSDoc documentation in generated schema')
  .option('--function-prefix <prefix>', 'Prefix for generated function names', 'stringifier')
  .option('--indent-style <style>', 'Indentation style for generated code', '  ')
  .option('--no-whitespace', 'Disable whitespace formatting in generated functions')
  .option('--no-formatting', 'Disable advanced formatting options')
  .option('--include-debug', 'Include debug info in parser output', false)
  .action(async (modelFile: string, language: string, options: {
    includeDocs?: boolean;
    functionPrefix?: string;
    indentStyle?: string;
    whitespace?: boolean;
    formatting?: boolean;
    includeDebug?: boolean;
  }, command: any) => {
    try {
      const globalOptions = command.parent.opts() as GlobalOptions;
      const verbose = globalOptions.verbose;

      if (verbose) {
        console.error(chalk.blue(`🚀 Starting complete BNF language generation for: ${language}`));
      }

      const outputDir = getLanguageDir(language);

      // Step 1: Generate schema
      if (verbose) {
        console.error(chalk.blue('📋 Step 1: Generating schema...'));
      }

      const modelData = loadBNFModel(modelFile);
      const parseResult = parseBNF(modelData);

      if (!parseResult.success) {
        console.error(chalk.red('❌ BNF model validation failed:'));
        parseResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      ensureDir(outputDir);

      // Generate schema
      const schemaConfig: GenerationConfig = {
        outputDir,
        separateFiles: true,
        includeDocumentation: options.includeDocs || false,
      };

      const schemaResult = generateCode(parseResult.model, schemaConfig);

      if (!schemaResult.success) {
        console.error(chalk.red('❌ Schema generation failed:'));
        schemaResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      if (schemaResult.files) {
        for (const [filePath, content] of schemaResult.files) {
          const fullPath = join(outputDir, filePath);
          const dir = dirname(fullPath);
          ensureDir(dir);
          writeFileSync(fullPath, content, 'utf-8');
          console.error(chalk.green(`✅ Schema: ${fullPath}`));
        }
      }

      // Step 2: Generate stringifier
      if (verbose) {
        console.error(chalk.blue('🔧 Step 2: Generating stringifier...'));
      }

      const stringifierConfig: StringifierConfig = {
        functionPrefix: options.functionPrefix || 'stringifier',
        indentStyle: options.indentStyle || '  ',
        includeWhitespace: options.whitespace !== false,
        includeFormatting: options.formatting !== false,
      };

      const stringifyResult = generateStringifierFunctions(parseResult.model, stringifierConfig);

      if (!stringifyResult.success) {
        console.error(chalk.red('❌ Stringifier generation failed:'));
        stringifyResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      let code = stringifyResult.code || '';
      code = code.replace(` } from './index.js';`, ` } from './index.js';`);

      const stringifierPath = join(outputDir, 'stringifier.ts');
      writeFileSync(stringifierPath, code, 'utf-8');
      console.error(chalk.green(`✅ Stringifier: ${stringifierPath}`));

      // Step 3: Generate parser
      if (verbose) {
        console.error(chalk.blue('⚙️  Step 3: Generating parser...'));
      }

      const parserResult = generatePegGrammar(parseResult.model, {
        includeWhitespace: true,
        includeLocation: true,
        includeDebugInfo: options.includeDebug || false
      });

      const grammarPath = join(outputDir, 'grammar.pegjs');
      writeFileSync(grammarPath, parserResult.grammar, 'utf-8');
      console.error(chalk.green(`✅ Parser: ${grammarPath}`));

      // Write model info
      const modelInfoPath = join(outputDir, 'model-info.json');
      const modelInfo = {
        name: parseResult.model.name,
        version: parseResult.model.version,
        generatedAt: new Date().toISOString(),
        stats: parserResult.stats,
        warnings: parserResult.warnings
      };
      writeFileSync(modelInfoPath, JSON.stringify(modelInfo, null, 2), 'utf-8');
      console.error(chalk.green(`✅ Model info: ${modelInfoPath}`));

      // Summary
      console.error('');
      console.error(chalk.green('🎉 Complete BNF language generation finished!'));
      console.error(chalk.blue(`📁 Output directory: ${outputDir}`));
      console.error(chalk.blue(`📊 Generated for ${Object.keys(parseResult.model.nodes).length} node types`));
      console.error(chalk.blue(`📊 Parser rules: ${parserResult.stats.totalRules} total`));

      if (parserResult.warnings.length > 0) {
        console.error('');
        console.error(chalk.yellow('⚠️  Warnings:'));
        parserResult.warnings.forEach(warning => console.error(chalk.yellow(`  - ${warning}`)));
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error?.message || error}`));
      process.exit(1);
    }
  });

// Main execution
program.parseAsync(process.argv).catch((error: any) => {
  console.error(chalk.red(`❌ CLI Error: ${error?.message || error}`));
  process.exit(1);
});
