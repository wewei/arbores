#!/usr/bin/env bun
/**
 * BNF Model CLI Tool
 * 
 * Command-line interface for working with BNF grammar models.
 * Provides validation, schema generation, and stringify function generation.
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { dirname, join, basename, extname } from 'path';
import { load as loadYaml } from 'js-yaml';
import chalk from 'chalk';

import { parseBNF } from '../src/core/bnf-model/bnf-parser.js';
import { generateCode, type GenerationConfig } from '../src/core/bnf-model/generator.js';
import { generateStringifierFunctions, type StringifierConfig } from '../src/core/bnf-model/stringifier-generator.js';
import type { BNFModel } from '../src/core/bnf-model/types.js';

const program = new Command();

// Global options and utility functions
interface GlobalOptions {
  output?: string;
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
 * Clean target directory or file if it exists
 */
function cleanTarget(targetPath: string, verbose: boolean = false): void {
  if (existsSync(targetPath)) {
    try {
      rmSync(targetPath, { recursive: true, force: true });
      if (verbose) {
        console.error(chalk.yellow(`🗑️  Cleaned: ${targetPath}`));
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Failed to clean ${targetPath}: ${error?.message || error}`));
      process.exit(1);
    }
  }
}

/**
 * Output result to stdout or file
 */
function outputResult(content: string, options: GlobalOptions, defaultFilename?: string): void {
  if (options.output) {
    try {
      writeFileSync(options.output, content, 'utf-8');
      console.error(chalk.green(`✅ Output written to: ${options.output}`));
    } catch (error: any) {
      console.error(chalk.red(`❌ Failed to write to file: ${error?.message || error}`));
      process.exit(1);
    }
  } else if (defaultFilename) {
    console.error(chalk.yellow(`💡 Tip: Use -o ${defaultFilename} to save output to file`));
    console.log(content);
  } else {
    console.log(content);
  }
}

/**
 * Format validation errors and warnings
 */
function formatValidationResult(result: any): string {
  const lines: string[] = [];

  if (result.success) {
    lines.push(chalk.green('✅ BNF model validation passed'));

    if (result.warnings && result.warnings.length > 0) {
      lines.push('');
      lines.push(chalk.yellow('⚠️  Warnings:'));
      result.warnings.forEach((warning: string, index: number) => {
        lines.push(chalk.yellow(`  ${index + 1}. ${warning}`));
      });
    }

    // Add model summary
    lines.push('');
    lines.push(chalk.blue('📋 Model Summary:'));
    lines.push(`  Name: ${result.model.name}`);
    lines.push(`  Version: ${result.model.version}`);
    lines.push(`  Start rule: ${result.model.start}`);
    lines.push(`  Total nodes: ${Object.keys(result.model.nodes).length}`);

    // Count node types
    const nodeCounts = { token: 0, deduction: 0, union: 0 };
    Object.values(result.model.nodes).forEach((node: any) => {
      if (node.type in nodeCounts) {
        nodeCounts[node.type as keyof typeof nodeCounts]++;
      }
    });

    lines.push(`  - Token nodes: ${nodeCounts.token}`);
    lines.push(`  - Deduction nodes: ${nodeCounts.deduction}`);
    lines.push(`  - Union nodes: ${nodeCounts.union}`);
  } else {
    lines.push(chalk.red('❌ BNF model validation failed'));
    lines.push('');
    lines.push(chalk.red('Errors:'));
    result.errors.forEach((error: string, index: number) => {
      lines.push(chalk.red(`  ${index + 1}. ${error}`));
    });

    if (result.warnings && result.warnings.length > 0) {
      lines.push('');
      lines.push(chalk.yellow('Warnings:'));
      result.warnings.forEach((warning: string, index: number) => {
        lines.push(chalk.yellow(`  ${index + 1}. ${warning}`));
      });
    }
  }

  return lines.join('\n');
}

// Configure main program
program
  .name('bnf-model')
  .description('CLI tool for working with BNF grammar models')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose output');

// Validate command
program
  .command('validate')
  .description('Validate a BNF model file for correctness and completeness')
  .argument('<file>', 'Path to BNF model file (.json, .yaml, or .yml)')
  .option('-o, --output <file>', 'Write validation report to file instead of stdout')
  .action(async (file: string, options: GlobalOptions, command: any) => {
    try {
      // Get global options from parent command
      const globalOptions = command.parent.opts();
      const verbose = globalOptions.verbose || options.verbose;

      if (verbose) {
        console.error(chalk.blue(`🔍 Loading BNF model from: ${file}`));
      }

      const modelData = loadBNFModel(file);

      if (verbose) {
        console.error(chalk.blue('🔧 Validating BNF model...'));
      }

      const result = parseBNF(modelData);
      const report = formatValidationResult(result);

      outputResult(report, options, 'validation-report.txt');

      // Exit with appropriate code
      if (!result.success) {
        process.exit(1);
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error?.message || error}`));
      process.exit(1);
    }
  });

// Generate command
const generateCmd = program
  .command('generate')
  .description('Generate code from BNF model (schema, stringify, parser)');

// Generate schema subcommand
generateCmd
  .command('schema')
  .description('Generate TypeScript type definitions from BNF model')
  .argument('<file>', 'Path to BNF model file (.json, .yaml, or .yml)')
  .option('-o, --output <dir>', 'Output directory for generated files')
  .option('-c, --clean', 'Clean output directory before generation')
  .option('--include-docs', 'Include JSDoc documentation in generated code')
  .action(async (file: string, options: GlobalOptions & {
    includeDocs?: boolean;
    clean?: boolean;
  }, command: any) => {
    try {
      // Get global options from parent command
      const globalOptions = command.parent.opts();
      const verbose = globalOptions.verbose || options.verbose;
      if (verbose) {
        console.error(chalk.blue(`🔍 Loading BNF model from: ${file}`));
      }

      const modelData = loadBNFModel(file);
      const parseResult = parseBNF(modelData);

      if (!parseResult.success) {
        console.error(chalk.red('❌ BNF model validation failed:'));
        parseResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      if (verbose) {
        console.error(chalk.blue('🏗️  Generating TypeScript schema...'));
      }

      if (!options.output) {
        console.error(chalk.red('❌ Output directory is required for schema generation'));
        console.error(chalk.yellow('💡 Use -o <dir> to specify output directory'));
        process.exit(1);
      }

      // Clean output directory if requested
      if (options.clean) {
        cleanTarget(options.output, verbose);
      }

      // Ensure output directory exists
      try {
        mkdirSync(options.output, { recursive: true });
      } catch (error: any) {
        console.error(chalk.red(`❌ Failed to create output directory: ${error?.message || error}`));
        process.exit(1);
      }

      const config: GenerationConfig = {
        outputDir: options.output,
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
          const fullPath = join(options.output, filePath);
          const dir = dirname(fullPath);

          // Ensure subdirectory exists
          try {
            mkdirSync(dir, { recursive: true });
          } catch {
            // Directory already exists
          }

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

// Generate stringifier subcommand
generateCmd
  .command('stringifier')
  .description('Generate stringifier functions from BNF model')
  .argument('<file>', 'Path to BNF model file (.json, .yaml, or .yml)')
  .option('-o, --output <file>', 'Output file for generated stringifier functions (default: stdout)')
  .option('-c, --clean', 'Clean output file before generation (only for file output)')
  .option('--function-prefix <prefix>', 'Prefix for generated function names', 'stringifier')
  .option('--indent-style <style>', 'Indentation style for generated code', '  ')
  .option('--no-whitespace', 'Disable whitespace formatting in generated functions')
  .option('--no-formatting', 'Disable advanced formatting options')
  .option('--types-file', 'Generate separate .d.ts file for TypeScript definitions')
  .action(async (file: string, options: GlobalOptions & {
    functionPrefix?: string;
    indentStyle?: string;
    whitespace?: boolean;
    formatting?: boolean;
    typesFile?: boolean;
    clean?: boolean;
  }, command: any) => {
    try {
      // Get global options from parent command
      const globalOptions = command.parent.opts();
      const verbose = globalOptions.verbose || options.verbose;

      if (verbose) {
        console.error(chalk.blue(`🔍 Loading BNF model from: ${file}`));
      }

      const modelData = loadBNFModel(file);
      const parseResult = parseBNF(modelData);

      if (!parseResult.success) {
        console.error(chalk.red('❌ BNF model validation failed:'));
        parseResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      if (verbose) {
        console.error(chalk.blue('🔧 Generating stringify functions...'));
      }

      // Clean output file(s) if requested and output file is specified
      if (options.clean && options.output) {
        cleanTarget(options.output, verbose);

        if (options.typesFile) {
          const baseName = basename(options.output, extname(options.output));
          const typesPath = join(dirname(options.output), `${baseName}.d.ts`);
          cleanTarget(typesPath, verbose);
        }
      }

      const config: StringifierConfig = {
        functionPrefix: options.functionPrefix || 'stringify',
        indentStyle: options.indentStyle || '  ',
        includeWhitespace: options.whitespace !== false,
        includeFormatting: options.formatting !== false,
      };

      const stringifyResult = generateStringifierFunctions(parseResult.model, config);

      if (!stringifyResult.success) {
        console.error(chalk.red('❌ Stringify generation failed:'));
        stringifyResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      if (options.typesFile && options.output) {
        // Generate separate .d.ts file
        const baseName = basename(options.output, extname(options.output));
        const typesPath = join(dirname(options.output), `${baseName}.d.ts`);

        writeFileSync(options.output, stringifyResult.code || '', 'utf-8');
        writeFileSync(typesPath, stringifyResult.types || '', 'utf-8');

        console.error(chalk.green(`✅ Stringify functions written to: ${options.output}`));
        console.error(chalk.green(`✅ Type definitions written to: ${typesPath}`));
      } else {
        // Single file output
        const combinedContent = [
          stringifyResult.types || '',
          stringifyResult.code || ''
        ].filter(Boolean).join('\n\n');

        outputResult(combinedContent, options, `${parseResult.model.name.toLowerCase()}-stringify.ts`);
      }

      if (verbose) {
        console.error(chalk.green('✅ Stringify generation completed'));
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error?.message || error}`));
      process.exit(1);
    }
  });

// Generate parser subcommand
generateCmd
  .command('parser')
  .description('Generate PEG.js parser from BNF model')
  .argument('<file>', 'Path to BNF model file (.json, .yaml, or .yml)')
  .option('-o, --output <file>', 'Output file for generated parser (default: stdout)')
  .option('-c, --clean', 'Clean output file before generation (only for file output)')
  .option('--grammar-only', 'Generate only PEG.js grammar file (no compiled parser)')
  .option('--function-prefix <prefix>', 'Prefix for generated parser functions', 'parse')
  .option('--no-whitespace', 'Disable automatic whitespace handling in grammar')
  .option('--no-formatting', 'Disable advanced parsing options')
  .option('--types-file', 'Generate separate .d.ts file for TypeScript definitions')
  .option('--start-rule <rule>', 'Override start rule for the parser')
  .action(async (file: string, options: GlobalOptions & {
    grammarOnly?: boolean;
    functionPrefix?: string;
    whitespace?: boolean;
    formatting?: boolean;
    typesFile?: boolean;
    clean?: boolean;
    startRule?: string;
  }, command: any) => {
    try {
      // Get global options from parent command
      const globalOptions = command.parent.opts();
      const verbose = globalOptions.verbose || options.verbose;

      if (verbose) {
        console.error(chalk.blue(`🔍 Loading BNF model from: ${file}`));
      }

      const modelData = loadBNFModel(file);
      const parseResult = parseBNF(modelData);

      if (!parseResult.success) {
        console.error(chalk.red('❌ BNF model validation failed:'));
        parseResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      if (verbose) {
        console.error(chalk.blue('🔧 Generating PEG.js parser...'));
      }

      // Clean output file(s) if requested and output file is specified
      if (options.clean && options.output) {
        cleanTarget(options.output, verbose);

        if (options.typesFile) {
          const baseName = basename(options.output, extname(options.output));
          const typesPath = join(dirname(options.output), `${baseName}.d.ts`);
          cleanTarget(typesPath, verbose);
        }
      }

      // TODO: Implement PEG.js parser generation
      // This will be implemented in Phase 3.1
      console.error(chalk.yellow('⚠️  Parser generation not yet implemented'));
      console.error(chalk.blue('💡 This feature will be available in Phase 3.1'));
      console.error(chalk.blue('   Current available commands: validate, generate schema, generate stringify'));

      /*
      const config: ParserConfig = {
        functionPrefix: options.functionPrefix || 'parse',
        startRule: options.startRule || parseResult.model.start,
        includeWhitespace: options.whitespace !== false,
        includeFormatting: options.formatting !== false,
        grammarOnly: options.grammarOnly || false,
      };

      const parserResult = generateParser(parseResult.model, config);

      if (!parserResult.success) {
        console.error(chalk.red('❌ Parser generation failed:'));
        parserResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      if (options.typesFile && options.output) {
        // Generate separate .d.ts file
        const baseName = basename(options.output, extname(options.output));
        const typesPath = join(dirname(options.output), `${baseName}.d.ts`);

        writeFileSync(options.output, parserResult.code || '', 'utf-8');
        writeFileSync(typesPath, parserResult.types || '', 'utf-8');

        console.error(chalk.green(`✅ Parser written to: ${options.output}`));
        console.error(chalk.green(`✅ Type definitions written to: ${typesPath}`));
      } else {
        // Single file output
        const combinedContent = [
          parserResult.types || '',
          parserResult.code || ''
        ].filter(Boolean).join('\n\n');

        outputResult(combinedContent, options, `${parseResult.model.name.toLowerCase()}-parser.ts`);
      }

      if (verbose) {
        console.error(chalk.green('✅ Parser generation completed'));
      }
      */
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
