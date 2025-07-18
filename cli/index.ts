#!/usr/bin/env bun

import { Command } from 'commander';
import { parseCommand } from './parse';
import { stringifyCommand } from './stringify';
import { rootCommand, childCommand, treeCommand } from './query';

const program = new Command();

program
  .name('arbores')
  .description('TypeScript AST parser and query tool')
  .version('1.0.0');

// 添加 parse 命令
program
  .command('parse')
  .description('Parse TypeScript file to AST file')
  .argument('<file>', 'TypeScript file to parse')
  .option('-a, --ast <path>', 'Output AST file path')
  .option('-n, --dry-run', 'Dry run mode (only output to stdout)')
  .option('-d, --description <desc>', 'Version description')
  .action(parseCommand);

// 添加 stringify 命令
program
  .command('stringify')
  .description('Convert AST node back to TypeScript code')
  .argument('<file>', 'AST file')
  .option('-n, --node <id>', 'Node ID to stringify (defaults to latest root)')
  .option('-f, --format <format>', 'Output format (compact|readable|minified)', 'readable')
  .action(stringifyCommand);

// 添加 root 命令
program
  .command('root')
  .description('Get root node IDs from AST file')
  .argument('<file>', 'AST file')
  .option('--latest', 'Output only the latest version root node ID')
  .action(rootCommand);

// 添加 child 命令
program
  .command('child')
  .description('Get children of a node from AST file')
  .argument('<file>', 'AST file')
  .option('-n, --node <id>', 'Node ID to get children for')
  .action(childCommand);

// 添加 tree 命令
program
  .command('tree')
  .description('Display tree structure of a node from AST file')
  .argument('<file>', 'AST file')
  .option('-n, --node <id>', 'Node ID to display tree for (defaults to latest root)')
  .action(treeCommand);

program.parse();