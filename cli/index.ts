#!/usr/bin/env bun

import { Command } from 'commander';
import { parseCommand } from './parse';
import { stringifyCommand } from './stringify';
import { rootsCommand, childrenCommand, treeCommand } from './query';
import { nodeCommand } from './node';
import { parentsCommand } from './parents';

const program = new Command();

program
  .name('arbores')
  .description('High-performance TypeScript AST parser and code generator with complete syntax support')
  .version('0.0.3');

// Custom help formatter for main command
program.configureHelp({
  formatHelp: (cmd, helper) => {
    const termWidth = helper.padWidth(cmd, helper);
    
    let output = `${helper.commandUsage(cmd)}\n`;
    
    const description = helper.commandDescription(cmd);
    if (description) {
      output += `\n${description}\n`;
    }
    
    const globalOptions = helper.visibleGlobalOptions(cmd);
    if (globalOptions.length > 0) {
      output += '\nOptions:\n';
      globalOptions.forEach(option => {
        output += '  ' + helper.optionTerm(option).padEnd(termWidth) + helper.optionDescription(option) + '\n';
      });
    }
    
    const commands = helper.visibleCommands(cmd);
    if (commands.length > 0) {
      output += '\nCommands:\n';
      
      // Conversion commands
      output += '\n  Conversion:\n';
      ['parse', 'stringify'].forEach(cmdName => {
        const command = commands.find(c => c.name() === cmdName);
        if (command) {
          const term = helper.subcommandTerm(command);
          const desc = helper.subcommandDescription(command);
          output += '    ' + term.padEnd(Math.max(28, term.length + 2)) + desc + '\n';
        }
      });
      
      // Query & Analysis commands
      output += '\n  Query & Analysis:\n';
      ['roots', 'children', 'parents', 'tree', 'node'].forEach(cmdName => {
        const command = commands.find(c => c.name() === cmdName);
        if (command) {
          const term = helper.subcommandTerm(command);
          const desc = helper.subcommandDescription(command);
          output += '    ' + term.padEnd(Math.max(28, term.length + 2)) + desc + '\n';
        }
      });
      
      // Add any remaining commands
      const processedCommands = new Set(['parse', 'stringify', 'roots', 'children', 'parents', 'tree', 'node']);
      const remainingCommands = commands.filter(c => !processedCommands.has(c.name()));
      if (remainingCommands.length > 0) {
        output += '\n  Other:\n';
        remainingCommands.forEach(command => {
          const term = helper.subcommandTerm(command);
          const desc = helper.subcommandDescription(command);
          output += '    ' + term.padEnd(Math.max(28, term.length + 2)) + desc + '\n';
        });
      }
    }
    
    return output;
  }
});

// =================================
// CONVERSION COMMANDS
// =================================

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

program
  .command('stringify')
  .description('Convert AST node back to TypeScript code')
  .argument('<file>', 'AST file')
  .option('-n, --node <id>', 'Node ID to stringify (defaults to latest root)')
  .option('-f, --format <format>', 'Output format (compact|readable|minified)', 'readable')
  .action(stringifyCommand);

// =================================
// QUERY & ANALYSIS COMMANDS  
// =================================

program
  .command('roots')
  .description('Get root node IDs from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .option('--latest', 'Output only the latest version root node ID')
  .option('-v, --verbose', 'Show detailed information (timestamp and description)')
  .action(rootsCommand);

program
  .command('children')
  .description('Get children of a node from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .option('-n, --node <id>', 'Node ID to get children for (defaults to latest root)')
  .action(childrenCommand);

program
  .command('parents')
  .description('Get parent nodes of a node from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .option('-n, --node <id>', 'Node ID to get parents for (defaults to latest root)')
  .option('-v, --verbose', 'Show detailed information about parent nodes')
  .action(parentsCommand);

program
  .command('tree')
  .description('Display tree structure of a node from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .option('-n, --node <id>', 'Node ID to display tree for (defaults to latest root)')
  .option('-c, --comments', 'Show comments in tree output')
  .action(treeCommand);

program
  .command('node')
  .description('Display detailed information about a specific node from AST file (supports JSON and YAML)')
  .argument('<file>', 'AST file (format auto-detected from extension)')
  .requiredOption('-n, --node <id>', 'Node ID to display information for')
  .option('-f, --format <format>', 'Output format (table|json|yaml)', 'table')
  .action((file, options) => nodeCommand(file, options.node, options));

program.parse();