/**
 * Tree Command - Display tree structure of a node from AST file
 */

import { getLatestRoot, renderTreeForCLI } from '../../core';
import { 
  readFile, 
  fileExists,
  parseASTFile,
  handleResult, 
  handleError, 
  type QueryOptions
} from '../utils';

/**
 * Tree command options
 */
export interface TreeCommandOptions extends Pick<QueryOptions, 'verbose'> {
  node?: string;      // Node ID to display tree for (defaults to latest root)
  comments?: boolean; // Show comments in tree output
}

/**
 * Execute tree command
 */
export async function treeCommand(
  astFilePath: string,
  options: TreeCommandOptions = {}
): Promise<void> {
  try {
    if (options.verbose) {
      console.log(`Displaying tree structure from AST: ${astFilePath}`);
    }

    // Check if AST file exists
    if (!fileExists(astFilePath)) {
      throw new Error(`AST file not found: ${astFilePath}`);
    }

    // Read and parse AST (supports both JSON and YAML)
    const ast = await parseASTFile(astFilePath);

    // Determine node ID
    let nodeId = options.node;
    if (!nodeId) {
      // Use the latest version's root node
      const latestRootResult = handleResult(getLatestRoot(ast), { verbose: options.verbose });
      nodeId = latestRootResult.id;
      if (options.verbose) {
        console.log(`Using latest root node: ${nodeId}`);
      }
    }

    // Render tree using core API
    const treeResult = renderTreeForCLI(ast, nodeId, options.comments || false, getTerminalWidth());
    const lines = handleResult(treeResult, { verbose: options.verbose });

    // Print the tree
    lines.forEach((line: string) => console.log(line));

    if (options.verbose) {
      console.log(`\nDisplayed tree structure for node ${nodeId}`);
    }

  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), { verbose: options.verbose });
    process.exit(1);
  }
}

/**
 * Get terminal width
 */
function getTerminalWidth(): number {
  try {
    // 优先使用环境变量（用于测试和CI环境）
    const envColumns = process.env.COLUMNS;
    if (envColumns) {
      const width = parseInt(envColumns, 10);
      if (!isNaN(width) && width > 0) {
        return width;
      }
    }
    
    // 然后尝试从stdout获取
    return process.stdout.columns || 80;
  } catch {
    return 80; // fallback width
  }
}
