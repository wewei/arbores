/**
 * Parents Command - Get parent nodes of a node from AST file
 */

import { getParents, getLatestRoot } from '../../core';
import { getSyntaxKindName } from '../../core/syntax-kind-names';
import { 
  readFile, 
  parseASTFile, 
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
 * Parents command options
 */
export interface ParentsCommandOptions extends QueryOptions {
  node?: string;   // Node ID to get parents for (defaults to latest root)
}

/**
 * Execute parents command
 */
export async function parentsCommand(
  astFilePath: string,
  options: ParentsCommandOptions = {}
): Promise<void> {
  try {
    // Validate and normalize options
    const format = options.format && isValidQueryFormat(options.format) 
      ? options.format 
      : 'markdown'; // Default to markdown for parents command

    if (options.verbose) {
      console.log(`Getting parents from AST: ${astFilePath}`);
      console.log(`Format: ${format}`);
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

    // Get parents
    const parents = handleResult(getParents(ast, nodeId), { verbose: options.verbose });

    let outputContent;
    if (parents.length === 0) {
      if (format === 'markdown') {
        outputContent = 'No parent nodes found (this might be a root node)';
      } else {
        outputContent = formatQueryOutput({ parents: [] }, format);
      }
    } else {
      if (format === 'markdown') {
        if (options.output) {
          // Markdown table format for file output
          let md = '| Parent ID | Kind | Kind Name | Text |\n';
          md += '|-----------|------|-----------|------|\n';
          parents.forEach(parent => {
            const kindName = getSyntaxKindName(parent.kind);
            const text = parent.text ? `\`${parent.text.replace(/`/g, '\\`')}\`` : '_None_';
            md += `| \`${parent.id}\` | ${parent.kind} | ${kindName} | ${text} |\n`;
          });
          outputContent = md;
        } else {
          // Aligned table for terminal output
          const headers = ['Parent ID', 'Kind', 'Kind Name', 'Text'];
          const rows = parents.map(parent => {
            const kindName = getSyntaxKindName(parent.kind);
            const text = parent.text || 'None';
            return [parent.id, parent.kind.toString(), kindName, text];
          });
          outputContent = formatAlignedTable(headers, rows);
        }
      } else {
        // JSON/YAML format
        const formattedResult = {
          child_node_id: nodeId,
          parents: parents.map(parent => ({
            id: parent.id,
            kind: parent.kind,
            kind_name: getSyntaxKindName(parent.kind),
            text: parent.text || null
          }))
        };
        outputContent = formatQueryOutput(formattedResult, format);
      }
    }

    // Output results
    await outputData(outputContent, options.output);

    if (options.verbose) {
      console.log(`Found ${parents.length} parent nodes for node ${nodeId}`);
      if (options.output) {
        console.log(`Results saved to: ${options.output}`);
      }
    }

  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), { verbose: options.verbose });
    process.exit(1);
  }
}
