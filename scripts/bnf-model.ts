#!/usr/bin/env bun
/**
 * BNF Model CLI Tool
 * 
 * Command-line interface for working with BNF grammar models.
 * Provides validation, schema generation, and stringify function generation.
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, copyFileSync } from 'fs';
import { dirname, join, basename, extname, resolve, sep } from 'path';
import { tmpdir } from 'os';
import { load as loadYaml } from 'js-yaml';
import chalk from 'chalk';

import { parseBNF } from '../src/core/bnf-model/bnf-parser.js';
import { generateCode, type GenerationConfig } from '../src/core/bnf-model/generator.js';
import { generateStringifierFunctions, type StringifierConfig } from '../src/core/bnf-model/stringifier-generator.js';
import { generatePegGrammar } from '../src/core/bnf-model/peg-generator.js';
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
 * Clean target directory while preserving the BNF model file if it's inside
 */
function cleanTarget(targetPath: string, bnfModelFile: string, verbose: boolean = false): void {
  if (!existsSync(targetPath)) {
    return;
  }

  try {
    // Check if BNF model file is inside the target directory
    const absoluteTargetPath = resolve(targetPath);
    const absoluteBnfModelFile = resolve(bnfModelFile);
    const isModelFileInside = absoluteBnfModelFile.startsWith(absoluteTargetPath + sep) || 
                              absoluteBnfModelFile === absoluteTargetPath;

    let tempModelPath: string | null = null;

    if (isModelFileInside && existsSync(absoluteBnfModelFile)) {
      // Move BNF model file to temporary location
      tempModelPath = join(tmpdir(), `bnf-model-${Date.now()}-${basename(absoluteBnfModelFile)}`);
      if (verbose) {
        console.error(chalk.blue(`💾 Temporarily moving BNF model file to: ${tempModelPath}`));
      }
      copyFileSync(absoluteBnfModelFile, tempModelPath);
    }

    // Clean the target directory
    rmSync(targetPath, { recursive: true, force: true });
    if (verbose) {
      console.error(chalk.yellow(`🗑️  Cleaned: ${targetPath}`));
    }

    // Recreate the target directory
    mkdirSync(targetPath, { recursive: true });

    // Move BNF model file back if it was inside
    if (tempModelPath && isModelFileInside) {
      if (verbose) {
        console.error(chalk.blue(`📥 Restoring BNF model file to: ${absoluteBnfModelFile}`));
      }
      // Ensure the directory structure exists for the model file
      mkdirSync(dirname(absoluteBnfModelFile), { recursive: true });
      copyFileSync(tempModelPath, absoluteBnfModelFile);
      // Clean up temp file
      rmSync(tempModelPath, { force: true });
    }
  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to clean ${targetPath}: ${error?.message || error}`));
    process.exit(1);
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
program
  .command('generate')
  .description('Generate code from BNF model (schema, stringifier, parser)')
  .argument('<bnf-model-file>', 'Path to BNF model file (.json, .yaml, or .yml)')
  .argument('<targets...>', 'Generation targets: schema, stringifier, parser')
  .option('-o, --output <dir>', 'Output directory (default: bnf-model-file directory)')
  .option('-t, --types <file>', 'BNFModel base types file', 'src/core/bnf-model/types.ts')
  .option('-c, --clean', 'Clean output directory before generation (preserve bnf-model-file)')
  .option('--verbose', 'Output detailed generation process information')
  .option('--dry-run', 'Simulate generation process without creating files')
  .action(async (bnfModelFile: string, targets: string[], options: GlobalOptions & {
    types?: string;
    clean?: boolean;
    dryRun?: boolean;
  }, command: any) => {
    try {
      // Get global options from parent command
      const globalOptions = command.parent.opts();
      const verbose = globalOptions.verbose || options.verbose;

      // Validate targets
      const validTargets = ['schema', 'stringifier', 'parser'];
      const invalidTargets = targets.filter(target => !validTargets.includes(target));
      if (invalidTargets.length > 0) {
        console.error(chalk.red(`❌ Invalid targets: ${invalidTargets.join(', ')}`));
        console.error(chalk.yellow(`💡 Valid targets: ${validTargets.join(', ')}`));
        process.exit(1);
      }

      if (targets.length === 0) {
        console.error(chalk.red('❌ At least one target must be specified'));
        console.error(chalk.yellow(`💡 Valid targets: ${validTargets.join(', ')}`));
        process.exit(1);
      }

      // Determine output directory
      const outputDir = options.output || dirname(bnfModelFile);

      if (verbose || options.dryRun) {
        console.error(chalk.blue(`🔍 Loading BNF model from: ${bnfModelFile}`));
        console.error(chalk.blue(`📁 Output directory: ${outputDir}`));
        console.error(chalk.blue(`📝 Types file: ${options.types}`));
        console.error(chalk.blue(`🎯 Targets: ${targets.join(', ')}`));
      }

      // Load and validate BNF model
      const modelData = loadBNFModel(bnfModelFile);
      const parseResult = parseBNF(modelData);

      if (!parseResult.success) {
        console.error(chalk.red('❌ BNF model validation failed:'));
        parseResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
        process.exit(1);
      }

      // Clean output directory if requested
      if (options.clean && !options.dryRun) {
        if (verbose) {
          console.error(chalk.blue('🧹 Cleaning output directory...'));
        }
        cleanTarget(outputDir, bnfModelFile, verbose);
      }

      // Ensure output directory exists
      if (!options.dryRun) {
        try {
          mkdirSync(outputDir, { recursive: true });
        } catch (error: any) {
          console.error(chalk.red(`❌ Failed to create output directory: ${error?.message || error}`));
          process.exit(1);
        }
      }

      // Copy BNF model file to output directory as grammar.bnf.yaml
      const bnfModelDestination = join(outputDir, 'grammar.bnf.yaml');
      if (!options.dryRun) {
        try {
          copyFileSync(bnfModelFile, bnfModelDestination);
          if (verbose) {
            console.error(chalk.green(`✅ Copied BNF model: ${bnfModelDestination}`));
          }
        } catch (error: any) {
          console.error(chalk.red(`❌ Failed to copy BNF model file: ${error?.message || error}`));
          process.exit(1);
        }
      } else if (verbose) {
        console.error(chalk.yellow(`📄 Would copy: ${bnfModelFile} → ${bnfModelDestination}`));
      }

      // Check dependencies (stringifier and parser depend on schema)
      const needsSchema = targets.includes('stringifier') || targets.includes('parser');
      if (needsSchema && !targets.includes('schema')) {
        if (verbose) {
          console.error(chalk.yellow('⚠️  Adding schema target (required by stringifier/parser)'));
        }
        targets.unshift('schema');
      }

      // Process each target
      for (const target of targets) {
        if (verbose || options.dryRun) {
          console.error(chalk.blue(`🏗️  Processing target: ${target}`));
        }

        switch (target) {
          case 'schema':
            await generateSchema(parseResult.model, outputDir, verbose, options.dryRun || false);
            break;
          case 'stringifier':
            await generateStringifier(parseResult.model, outputDir, verbose, options.dryRun || false);
            break;
          case 'parser':
            await generateParser(parseResult.model, outputDir, verbose, options.dryRun || false);
            break;
        }
      }

      if (verbose || options.dryRun) {
        console.error(chalk.green('✅ Generation completed'));
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error?.message || error}`));
      process.exit(1);
    }
  });

/**
 * Generate TypeScript schema from BNF model
 */
async function generateSchema(model: BNFModel, outputDir: string, verbose: boolean, dryRun: boolean): Promise<void> {
  if (verbose) {
    console.error(chalk.blue('🏗️  Generating TypeScript schema...'));
  }

  const schemaDir = join(outputDir, 'schema');
  const config: GenerationConfig = {
    outputDir: schemaDir,
    separateFiles: true,
    includeDocumentation: true,
  };

  const generationResult = generateCode(model, config);

  if (!generationResult.success) {
    console.error(chalk.red('❌ Schema generation failed:'));
    generationResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
    process.exit(1);
  }

  // Write generated files
  if (generationResult.files && !dryRun) {
    for (const [filePath, content] of generationResult.files) {
      const fullPath = join(schemaDir, filePath);
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
  } else if (generationResult.files && dryRun) {
    for (const [filePath] of generationResult.files) {
      const fullPath = join(schemaDir, filePath);
      console.error(chalk.yellow(`📄 Would generate: ${fullPath}`));
    }
  }
}

/**
 * Generate stringifier functions from BNF model
 */
async function generateStringifier(model: BNFModel, outputDir: string, verbose: boolean, dryRun: boolean): Promise<void> {
  if (verbose) {
    console.error(chalk.blue('🔧 Generating stringifier functions...'));
  }

  const stringifierDir = join(outputDir, 'stringifier');
  
  const config: StringifierConfig = {
    functionPrefix: 'stringify',
    indentStyle: '  ',
    includeWhitespace: true,
    includeFormatting: true,
  };

  const stringifyResult = generateStringifierFunctions(model, config);

  if (!stringifyResult.success) {
    console.error(chalk.red('❌ Stringifier generation failed:'));
    stringifyResult.errors?.forEach(error => console.error(chalk.red(`  - ${error}`)));
    process.exit(1);
  }

  if (!dryRun) {
    // Ensure stringifier directory exists
    mkdirSync(stringifierDir, { recursive: true });

    // For now, generate the main stringifier file
    // TODO: Split into individual node files as specified in the prompt
    const mainFile = join(stringifierDir, 'index.ts');
    const content = stringifyResult.code || '';
    
    writeFileSync(mainFile, content, 'utf-8');
    console.error(chalk.green(`✅ Generated: ${mainFile}`));
  } else {
    console.error(chalk.yellow(`📄 Would generate: ${join(stringifierDir, 'index.ts')}`));
    // TODO: List individual node files that would be generated
  }
}

/**
 * Generate parser from BNF model
 */
async function generateParser(model: BNFModel, outputDir: string, verbose: boolean, dryRun: boolean): Promise<void> {
  if (verbose) {
    console.error(chalk.blue('🔧 Generating parser...'));
  }

  try {
    const parserDir = join(outputDir, 'parser');
    
    // Generate PEG.js grammar
    const pegResult = generatePegGrammar(model, {
      startRule: model.start,
      includeWhitespace: true,
      includeLocation: true,
      includeDebugInfo: verbose
    });

    if (pegResult.warnings.length > 0) {
      pegResult.warnings.forEach(warning => {
        console.error(chalk.yellow(`⚠️  ${warning}`));
      });
    }

    if (verbose) {
      console.error(chalk.blue(`📊 Parser stats: ${pegResult.stats.totalRules} rules (${pegResult.stats.tokenRules} tokens, ${pegResult.stats.deductionRules} deductions, ${pegResult.stats.unionRules} unions)`));
      if (pegResult.stats.leftRecursiveRules.length > 0) {
        console.error(chalk.yellow(`⚠️  Left recursive rules detected: ${pegResult.stats.leftRecursiveRules.join(', ')}`));
      }
    }

    // Generate parser index.ts file
    const parserContent = `/**
 * Parser for ${model.name} v${model.version}
 * 
 * Generated from BNF model: ${model.name} v${model.version}
 * Generation time: ${new Date().toISOString()}
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
export const PARSER_STATS = ${JSON.stringify(pegResult.stats, null, 2)} as const;

/**
 * Load the PEG.js grammar
 */
function loadGrammar(): string {
  const grammarPath = join(__dirname, '${model.name.toLowerCase()}.syntax.pegjs');
  return readFileSync(grammarPath, 'utf-8');
}

/**
 * Parse input text using the generated PEG.js grammar
 * 
 * Note: This requires PEG.js to be installed and the grammar to be compiled.
 * You need to compile the grammar first using:
 * npx pegjs --output ${model.name.toLowerCase()}-parser.js ${model.name.toLowerCase()}.syntax.pegjs
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
`;

    if (dryRun) {
      console.error(chalk.yellow(`📄 Would generate: ${join(parserDir, 'index.ts')}`));
      console.error(chalk.yellow(`📄 Would generate: ${join(parserDir, `${model.name.toLowerCase()}.syntax.pegjs`)}`));
      if (verbose) {
        console.error(chalk.blue('📝 Parser content preview:'));
        console.error(parserContent.split('\n').slice(0, 20).join('\n') + '\n...');
      }
    } else {
      // Ensure parser directory exists
      mkdirSync(parserDir, { recursive: true });
      
      // Write index.ts
      const indexFile = join(parserDir, 'index.ts');
      writeFileSync(indexFile, parserContent, 'utf-8');
      console.error(chalk.green(`✅ Generated: ${indexFile}`));
      
      // Write PEG grammar file
      const grammarFile = join(parserDir, `${model.name.toLowerCase()}.syntax.pegjs`);
      writeFileSync(grammarFile, pegResult.grammar, 'utf-8');
      console.error(chalk.green(`✅ Generated: ${grammarFile}`));
      
      if (verbose) {
        console.error(chalk.blue('💡 To compile the parser, run:'));
        console.error(chalk.gray(`   cd ${parserDir}`));
        console.error(chalk.gray(`   npx pegjs --output ${model.name.toLowerCase()}-parser.js ${model.name.toLowerCase()}.syntax.pegjs`));
      }
    }
  } catch (error: any) {
    console.error(chalk.red(`❌ Parser generation failed: ${error?.message || error}`));
    if (verbose && error?.stack) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

// Main execution
program.parseAsync(process.argv).catch((error: any) => {
  console.error(chalk.red(`❌ CLI Error: ${error?.message || error}`));
  process.exit(1);
});
