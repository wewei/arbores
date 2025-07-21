/**
 * Roots Command - Get root node IDs from AST file
 */

import { getRoots } from '../../core';
import { 
  readFile, 
  fileExists, 
  handleResult, 
  handleError, 
  outputData,
  parseASTFile,
  formatQueryOutput,
  formatAlignedTable,
  isValidQueryFormat,
  getDefaultQueryFormat,
  type QueryOptions,
  type QueryOutputFormat
} from '../utils';

/**
 * Roots command options
 */
export interface RootsCommandOptions extends QueryOptions {
  latest?: boolean;   // Output only the latest version root node ID
}

/**
 * Execute roots command
 */
export async function rootsCommand(
  astFilePath: string,
  options: RootsCommandOptions = {}
): Promise<void> {
  try {
    // Validate and normalize options
    const format = options.format && isValidQueryFormat(options.format) 
      ? options.format 
      : 'markdown'; // Default to markdown for roots command

    if (options.verbose) {
      console.log(`Getting roots from AST: ${astFilePath}`);
      console.log(`Format: ${format}`);
    }

    // Check if AST file exists
    if (!fileExists(astFilePath)) {
      throw new Error(`AST file not found: ${astFilePath}`);
    }

    // Read and parse AST (supports both JSON and YAML)
    const ast = await parseASTFile(astFilePath);

    // Get roots
    const result = handleResult(getRoots(ast), { verbose: options.verbose });

    let outputContent;
    if (options.latest) {
      // Output only the latest version's root node ID
      if (result.length > 0) {
        const latestVersion = result[result.length - 1];
        if (!latestVersion) {
          throw new Error('Latest version is undefined');
        }
        if (format === 'markdown') {
          outputContent = latestVersion.root_node_id;
        } else {
          outputContent = formatQueryOutput({ root_node_id: latestVersion.root_node_id }, format);
        }
      } else {
        throw new Error('No versions found in AST file');
      }
    } else {
      // Output all root node IDs
      if (format === 'markdown') {
        if (options.verbose) {
          if (options.output) {
            // Markdown table format for file output
            let md = '| Version | Root Node ID | Created At | Description |\n';
            md += '|---------|--------------|------------|-------------|\n';
            result.forEach((version, index) => {
              const versionLabel = `v${index + 1}`;
              const timestamp = new Date(version.created_at).toLocaleString();
              const description = version.description || '_None_';
              md += `| ${versionLabel} | \`${version.root_node_id}\` | ${timestamp} | ${description} |\n`;
            });
            outputContent = md;
          } else {
            // Aligned table for terminal output
            const headers = ['Version', 'Root Node ID', 'Created At', 'Description'];
            const rows = result.map((version, index) => {
              const versionLabel = `v${index + 1}`;
              const timestamp = new Date(version.created_at).toLocaleString();
              const description = version.description || 'None';
              return [versionLabel, version.root_node_id, timestamp, description];
            });
            outputContent = formatAlignedTable(headers, rows);
          }
        } else {
          // Simple list format
          outputContent = result.map(version => version.root_node_id).join('\n');
        }
      } else {
        // JSON/YAML format
        const formattedResult = result.map((version, index) => ({
          version: `v${index + 1}`,
          root_node_id: version.root_node_id,
          created_at: version.created_at,
          description: version.description || null
        }));
        outputContent = formatQueryOutput(formattedResult, format);
      }
    }

    // Output results
    await outputData(outputContent, options.output);

    if (options.verbose) {
      if (options.latest) {
        console.log('Retrieved latest root node ID');
      } else {
        console.log(`Retrieved ${result.length} root versions`);
      }
      if (options.output) {
        console.log(`Results saved to: ${options.output}`);
      }
    }

  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), { verbose: options.verbose });
    process.exit(1);
  }
}
