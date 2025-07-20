#!/usr/bin/env bun

import { Command } from 'commander';
import { parseCommand } from './parse';
import { stringifyCommand } from './stringify';
import { rootsCommand, childrenCommand, treeCommand } from './query';

const program = new Command();

program
  .name('arbores')
  .description('TypeScript AST parser and query tool')
  .version('0.0.2');

// 添加 parse 命令
program
  .command('parse')
  .description('Parse TypeScript file to AST file (supports JSON and YAML formats)')
  .argument('<file>', 'TypeScript file to parse')
  .option('-a, --ast <path>', 'Output AST file path (format auto-detected from extension)')
  .option('-f, --format <format>', 'Output format (json|yaml|yml) - overrides extension detection')
  .option('-d, --dry-run', 'Dry run mode (only output to stdout)')
  .option('-O, --override', 'Override/write to AST file (required when using -a)')
  .option('-D, --description <desc>', 'Version description')
  .action(parseCommand);

// 添加 stringify 命令
program
  .command('stringify')
  .description('Convert AST node back to TypeScript code')
  .argument('<file>', 'AST file')
  .option('-n, --node <id>', 'Node ID to stringify (defaults to latest root)')
  .option('-f, --format <format>', 'Output format (compact|readable|minified)', 'readable')
  .action(stringifyCommand);

// 添加 roots 命令
program
  .command('roots')
  .description('Get root node IDs from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .option('--latest', 'Output only the latest version root node ID')
  .option('-v, --verbose', 'Show detailed information (timestamp and description)')
  .action(rootsCommand);

// 添加 children 命令
program
  .command('children')
  .description('Get children of a node from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .option('-n, --node <id>', 'Node ID to get children for (defaults to latest root)')
  .action(childrenCommand);

// 添加 tree 命令
program
  .command('tree')
  .description('Display tree structure of a node from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .option('-n, --node <id>', 'Node ID to display tree for (defaults to latest root)')
  .option('-c, --comments', 'Show comments in tree output')
  .action(treeCommand);

program.parse();