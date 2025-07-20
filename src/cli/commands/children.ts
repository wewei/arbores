/**
 * Children Command - Get children of a node from AST file
 */

import { getChildren, getLatestRoot } from '../../core';
import { getSyntaxKindName } from '../../core/syntax-kind-names';
import { 
  readFile, 
  fileExists, 
  handleResult, 
  handleError, 
  outputData,
  formatQueryOutput,
  formatAlignedTable,
  isValidQueryFormat,
  type QueryOptions,
  type QueryOutputFormat
} from '../utils';

/**
 * Children command options
 */
export interface ChildrenCommandOptions extends QueryOptions {
  node?: string;   // Node ID to get children for (defaults to latest root)
}

/**
 * Execute children command
 */
export async function childrenCommand(
  astFilePath: string,
  options: ChildrenCommandOptions = {}
): Promise<void> {
  try {
    // Validate and normalize options
    const format = options.format && isValidQueryFormat(options.format) 
      ? options.format 
      : 'markdown'; // Default to markdown for children command

    if (options.verbose) {
      console.log(`Getting children from AST: ${astFilePath}`);
      console.log(`Format: ${format}`);
    }

    // Check if AST file exists
    if (!fileExists(astFilePath)) {
      throw new Error(`AST file not found: ${astFilePath}`);
    }

    // Read and parse AST
    const astContent = await readFile(astFilePath);
    let ast;
    try {
      ast = JSON.parse(astContent);
    } catch (error) {
      throw new Error(`Invalid JSON in AST file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

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

    // Get children
    const children = handleResult(getChildren(ast, nodeId), { verbose: options.verbose });

    let outputContent;
    if (children.length === 0) {
      if (format === 'markdown') {
        outputContent = 'No children found';
      } else {
        outputContent = formatQueryOutput({ children: [] }, format);
      }
    } else {
      if (format === 'markdown') {
        if (options.output) {
          // Markdown table format for file output
          let md = '| Child ID | Kind | Kind Name | Text |\n';
          md += '|----------|------|-----------|------|\n';
          children.forEach(child => {
            const kindName = getSyntaxKindName(child.kind);
            const text = child.text ? `\`${child.text.replace(/`/g, '\\`')}\`` : '_None_';
            md += `| \`${child.id}\` | ${child.kind} | ${kindName} | ${text} |\n`;
          });
          outputContent = md;
        } else {
          // Aligned table for terminal output
          const headers = ['Child ID', 'Kind', 'Kind Name', 'Text'];
          const rows = children.map(child => {
            const kindName = getSyntaxKindName(child.kind);
            const text = child.text || 'None';
            return [child.id, child.kind.toString(), kindName, text];
          });
          outputContent = formatAlignedTable(headers, rows);
        }
      } else {
        // JSON/YAML format
        const formattedResult = {
          parent_node_id: nodeId,
          children: children.map(child => ({
            id: child.id,
            kind: child.kind,
            kind_name: getSyntaxKindName(child.kind),
            text: child.text || null
          }))
        };
        outputContent = formatQueryOutput(formattedResult, format);
      }
    }

    // Output results
    await outputData(outputContent, options.output);

    if (options.verbose) {
      console.log(`Found ${children.length} children for node ${nodeId}`);
      if (options.output) {
        console.log(`Results saved to: ${options.output}`);
      }
    }

  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), { verbose: options.verbose });
    process.exit(1);
  }
}
