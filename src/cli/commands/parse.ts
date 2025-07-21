/**
 * Parse Command - Convert TypeScript source code to AST
 * 
 * This command wraps the Parser API to provide CLI access to parsing functionality.
 * Supported output formats: json, yaml (markdown is NOT supported for parse)
 */

import { parseCode } from '../../core';
import { 
  readFile, 
  writeFile, 
  fileExists, 
  handleResult, 
  handleError, 
  outputData,
  formatQueryOutput,
  type QueryOptions
} from '../utils';

/**
 * Valid output formats for parse command (excludes markdown)
 */
export type ParseOutputFormat = 'json' | 'yaml';

/**
 * Validate parse output format
 */
function isValidParseFormat(format: any): format is ParseOutputFormat {
  return typeof format === 'string' && ['json', 'yaml'].includes(format);
}

/**
 * Get default parse output format
 */
function getDefaultParseFormat(): ParseOutputFormat {
  return 'json';
}

/**
 * Parse command options
 */
export interface ParseCommandOptions extends Omit<QueryOptions, 'format'> {
  format?: ParseOutputFormat; // Only json and yaml allowed
  ast?: string;          // Path to existing AST file (for merging)
  dryRun?: boolean;      // Don't write output file, just validate
  description?: string;  // Description for the new version
}

/**
 * Execute parse command
 */
export async function parseCommand(
  sourceFilePath: string,
  options: ParseCommandOptions = {}
): Promise<void> {
  try {
    // Validate and normalize options
    if (options.format && !isValidParseFormat(options.format)) {
      throw new Error(`Invalid format: ${options.format}. Valid formats are: json, yaml`);
    }
    
    const format = options.format && isValidParseFormat(options.format) 
      ? options.format 
      : getDefaultParseFormat();

    if (options.verbose) {
      console.error(`Parsing: ${sourceFilePath}`);
      console.error(`Format: ${format}`);
      if (options.ast) {
        console.error(`Existing AST: ${options.ast}`);
      }
    }

    // Check if source file exists
    if (!fileExists(sourceFilePath)) {
      throw new Error(`Source file not found: ${sourceFilePath}`);
    }

    // Read source code
    const sourceCode = await readFile(sourceFilePath);

    // Read existing AST if specified, or create empty one
    let baseAST;
    if (options.ast) {
      if (!fileExists(options.ast)) {
        throw new Error(`AST file not found: ${options.ast}`);
      }
      
      const astContent = await readFile(options.ast);
      try {
        baseAST = JSON.parse(astContent);
      } catch (error) {
        throw new Error(`Invalid JSON in AST file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Create empty AST
      baseAST = {
        file_name: sourceFilePath,
        versions: [],
        nodes: {}
      };
    }

    // Parse the source code
    const parseResult = handleResult(
      parseCode(sourceCode, baseAST, options.description),
      { verbose: options.verbose }
    );

    if (options.verbose) {
      console.error(`Parse completed. Generated ${parseResult.stats.nodeCount} nodes.`);
      console.error(`Root node ID: ${parseResult.rootNodeId}`);
    }

    // Format output
    const outputContent = formatQueryOutput(parseResult.ast, format);

    // Handle dry run
    if (options.dryRun) {
      console.log('Dry run - would output:');
      console.log(outputContent);
      return;
    }

    // Output results
    await outputData(outputContent, options.output);

    // Success message
    if (options.verbose && options.output) {
      console.error(`Successfully parsed ${sourceFilePath}`);
      console.error(`AST saved to: ${options.output}`);
      console.error(`Nodes: ${parseResult.stats.nodeCount}`);
      console.error(`Comments: ${parseResult.stats.commentCount}`);
      console.error(`Parse time: ${parseResult.stats.parseTime}ms`);
    }

  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), { verbose: options.verbose });
    process.exit(1);
  }
}
