/**
 * Parse Command - Convert TypeScript source code to AST
 * 
 * This command wraps the Parser API to provide CLI access to parsing functionality.
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
  isValidQueryFormat,
  getDefaultQueryFormat,
  type QueryOptions,
  type QueryOutputFormat
} from '../utils';

/**
 * Parse command options
 */
export interface ParseCommandOptions extends QueryOptions {
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
    const format = options.format && isValidQueryFormat(options.format) 
      ? options.format 
      : getDefaultQueryFormat();

    if (options.verbose) {
      console.log(`Parsing: ${sourceFilePath}`);
      console.log(`Format: ${format}`);
      if (options.ast) {
        console.log(`Existing AST: ${options.ast}`);
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
      parseCode(sourceCode, baseAST),
      { verbose: options.verbose }
    );

    if (options.verbose) {
      console.log(`Parse completed. Generated ${parseResult.stats.nodeCount} nodes.`);
      console.log(`Root node ID: ${parseResult.rootNodeId}`);
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
      console.log(`Successfully parsed ${sourceFilePath}`);
      console.log(`AST saved to: ${options.output}`);
      console.log(`Nodes: ${parseResult.stats.nodeCount}`);
      console.log(`Comments: ${parseResult.stats.commentCount}`);
      console.log(`Parse time: ${parseResult.stats.parseTime}ms`);
    }

  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), { verbose: options.verbose });
    process.exit(1);
  }
}
