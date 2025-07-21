/**
 * Stringify Command - Convert AST nodes back to TypeScript source code
 * 
 * This command wraps the Stringify API to provide CLI access to code generation functionality.
 */

import { 
  stringifyNode,
  stringifyNodes,
  stringifyVersion,
  stringifyLatestVersion,
  isValidStringifyFormat
} from '../../core';
import { 
  readFile, 
  fileExists, 
  handleResult, 
  handleError, 
  outputData,
  parseASTFile,
  isValidStringifyFormat as utilIsValidStringifyFormat,
  getDefaultStringifyFormat,
  type StringifyOptions,
  type StringifyOutputFormat
} from '../utils';

/**
 * Stringify command options
 */
export interface StringifyCommandOptions extends StringifyOptions {
  node?: string;         // Specific node ID to stringify
  nodes?: string[];      // Multiple node IDs to stringify
  version?: number;      // Specific version index to stringify
  latest?: boolean;      // Stringify latest version (default)
}

/**
 * Execute stringify command
 */
export async function stringifyCommand(
  astFilePath: string,
  options: StringifyCommandOptions = {}
): Promise<void> {
  try {
    // Validate and normalize options
    const format = options.format && utilIsValidStringifyFormat(options.format) 
      ? options.format 
      : getDefaultStringifyFormat();

    if (options.verbose) {
      console.log(`Stringifying AST: ${astFilePath}`);
      console.log(`Format: ${format}`);
    }

    // Check if AST file exists
    if (!fileExists(astFilePath)) {
      throw new Error(`AST file not found: ${astFilePath}`);
    }

    // Read and parse AST (supports both JSON and YAML)
    const ast = await parseASTFile(astFilePath);

    const stringifyOptions = { format };
    let result;
    let operationName = '';

    // Determine which operation to perform
    if (options.nodes && options.nodes.length > 0) {
      operationName = `Stringifying ${options.nodes.length} nodes`;
      result = handleResult(
        stringifyNodes(options.nodes, ast, stringifyOptions), 
        { verbose: options.verbose }
      );
      
      // Combine multiple results into a single output
      const combinedCode = result.map(r => r.code).join('\n\n');
      
      if (options.output) {
        await outputData(combinedCode, options.output);
      } else {
        console.log(combinedCode);
      }
      
    } else if (options.node) {
      operationName = `Stringifying node '${options.node}'`;
      result = handleResult(
        stringifyNode(options.node, ast, stringifyOptions), 
        { verbose: options.verbose }
      );
      
      if (options.output) {
        await outputData(result.code, options.output);
      } else {
        console.log(result.code);
      }
      
    } else if (typeof options.version === 'number') {
      if (!ast.versions || options.version >= ast.versions.length) {
        throw new Error(`Version index ${options.version} not found in AST`);
      }
      
      const version = ast.versions[options.version];
      operationName = `Stringifying version ${options.version}`;
      result = handleResult(
        stringifyVersion(version, ast, stringifyOptions), 
        { verbose: options.verbose }
      );
      
      if (options.output) {
        await outputData(result.code, options.output);
      } else {
        console.log(result.code);
      }
      
    } else {
      // Default: stringify latest version
      operationName = 'Stringifying latest version (default)';
      result = handleResult(
        stringifyLatestVersion(ast, stringifyOptions), 
        { verbose: options.verbose }
      );
      
      if (options.output) {
        await outputData(result.code, options.output);
      } else {
        console.log(result.code);
      }
    }

    if (options.verbose) {
      console.log(`Operation: ${operationName}`);
      if (result && !Array.isArray(result)) {
        console.log(`Generated ${result.code.split('\n').length} lines of code`);
        console.log(`Node: ${result.nodeId} (${result.nodeKind})`);
      }
      
      if (options.output) {
        console.log(`Code saved to: ${options.output}`);
      }
    }

  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), { verbose: options.verbose });
    process.exit(1);
  }
}
