#!/usr/bin/env bun

import { Command } from 'commander';
import { parseCommand } from './commands/parse';
import { stringifyCommand } from './commands/stringify';
import { rootsCommand } from './commands/roots';
import { childrenCommand } from './commands/children';
import { parentsCommand } from './commands/parents';
import { treeCommand } from './commands/tree';
import { nodeCommand } from './commands/node';

const program = new Command();

program
  .name('arbores')
  .description('High-performance TypeScript AST parser and code generator with complete syntax support')
  .version('0.0.3');

// Parse command
program
  .command('parse')
  .description('Parse TypeScript source code into AST')
  .argument('<source>', 'TypeScript source file path')
  .option('--ast <path>', 'Existing AST file to merge with')
  .option('--output <path>', 'Output file path')
  .option('--format <format>', 'Output format (json, yaml, markdown)', 'json')
  .option('--dry-run', 'Don\'t write output file, just validate')
  .option('--description <text>', 'Description for the new version')
  .option('--verbose', 'Enable verbose output')
  .action(async (source, options) => {
    await parseCommand(source, options);
  });

// Stringify command
program
  .command('stringify')
  .description('Convert AST nodes back to TypeScript source code')
  .argument('<ast>', 'AST file path')
  .option('--node <id>', 'Specific node ID to stringify')
  .option('--nodes <ids>', 'Comma-separated list of node IDs to stringify')
  .option('--version <index>', 'Specific version index to stringify', parseInt)
  .option('--latest', 'Stringify latest version (default)')
  .option('--output <path>', 'Output file path')
  .option('--format <format>', 'Code format (compact, readable, minified)', 'readable')
  .option('--verbose', 'Enable verbose output')
  .action(async (ast, options) => {
    // Parse nodes option if provided
    if (options.nodes) {
      options.nodes = options.nodes.split(',').map((s: string) => s.trim());
    }
    await stringifyCommand(ast, options);
  });

// Roots command
program
  .command('roots')
  .description('Get root node IDs from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .option('--latest', 'Output only the latest version root node ID')
  .option('-v, --verbose', 'Show detailed information (timestamp and description)')
  .option('-f, --format <format>', 'Output format (markdown|json|yaml)', 'markdown')
  .option('-o, --output <path>', 'Output file path')
  .action(async (file, options) => {
    await rootsCommand(file, options);
  });

// Children command
program
  .command('children')
  .description('Get children of a node from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .option('-n, --node <id>', 'Node ID to get children for (defaults to latest root)')
  .option('-f, --format <format>', 'Output format (markdown|json|yaml)', 'markdown')
  .option('-o, --output <path>', 'Output file path')
  .option('-v, --verbose', 'Enable verbose output')
  .action(async (file, options) => {
    await childrenCommand(file, options);
  });

// Parents command
program
  .command('parents')
  .description('Get parent nodes of a node from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .option('-n, --node <id>', 'Node ID to get parents for (defaults to latest root)')
  .option('-v, --verbose', 'Show detailed information about parent nodes')
  .option('-f, --format <format>', 'Output format (markdown|json|yaml)', 'markdown')
  .option('-o, --output <path>', 'Output file path')
  .action(async (file, options) => {
    await parentsCommand(file, options);
  });

// Tree command
program
  .command('tree')
  .description('Display tree structure of a node from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .option('-n, --node <id>', 'Node ID to display tree for (defaults to latest root)')
  .option('-c, --comments', 'Show comments in tree output')
  .option('-v, --verbose', 'Enable verbose output')
  .action(async (file, options) => {
    await treeCommand(file, options);
  });

// Node command
program
  .command('node')
  .description('Display detailed information about a specific node from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .requiredOption('-n, --node <id>', 'Node ID to display information for')
  .option('-f, --format <format>', 'Output format (markdown|json|yaml)', 'markdown')
  .option('-o, --output <path>', 'Output file path')
  .option('-v, --verbose', 'Enable verbose output')
  .action(async (file, options) => {
    await nodeCommand(file, options.node, options);
  });

program.parse();