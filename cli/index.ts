#!/usr/bin/env node

import { Command } from 'commander';
import { parseCommand } from './parse';
import { stringifyCommand } from './stringify';

const program = new Command();

program
  .name('arbores')
  .description('TypeScript AST parser and query tool')
  .version('1.0.0');

// 添加 parse 命令
program
  .command('parse')
  .description('Parse TypeScript file to AST JSON')
  .argument('<file>', 'TypeScript file to parse')
  .option('-f, --file <output>', 'Output JSON file path')
  .option('-n, --dry-run', 'Dry run mode (only output to stdout)')
  .option('-d, --description <desc>', 'Version description')
  .action(parseCommand);

// 添加 stringify 命令
program
  .command('stringify')
  .description('Convert AST node back to TypeScript code')
  .argument('<file>', 'AST JSON file')
  .argument('<node-id>', 'Node ID to stringify')
  .option('-f, --format <format>', 'Output format (compact|readable|minified)', 'readable')
  .action(stringifyCommand);

program.parse(); 