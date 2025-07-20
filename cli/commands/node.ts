/**
 * Node Command - Display detailed information about a specific node
 */

import { getNodeWithKindName } from '../../src/api';
import { getSyntaxKindName } from '../../src/syntax-kind-names';
import { 
  readFile, 
  fileExists, 
  handleResult, 
  handleError, 
  outputData,
  formatQueryOutput,
  isValidQueryFormat,
  type QueryOptions,
  type QueryOutputFormat
} from '../utils';

/**
 * Node command options
 */
export interface NodeCommandOptions extends QueryOptions {
  // node is required and passed as parameter
}

/**
 * Execute node command
 */
export async function nodeCommand(
  astFilePath: string,
  nodeId: string,
  options: NodeCommandOptions = {}
): Promise<void> {
  try {
    // Validate and normalize options
    const format = options.format && isValidQueryFormat(options.format) 
      ? options.format 
      : 'markdown'; // Default to markdown for node command

    if (options.verbose) {
      console.log(`Getting node details from AST: ${astFilePath}`);
      console.log(`Node ID: ${nodeId}`);
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

    // Get node with kind name
    const node = handleResult(getNodeWithKindName(ast, nodeId), { verbose: options.verbose });

    let outputContent;
    if (format === 'markdown') {
      // Markdown format for node details using headings instead of table
      let md = `# Node: \`${nodeId}\`\n\n`;
      
      md += `## Basic Information\n\n`;
      md += `**ID**: \`${node.id}\`\n\n`;
      md += `**Kind**: ${node.kind}\n\n`;
      md += `**Kind Name**: ${node.kindName}\n\n`;
      md += `**Text**: ${node.text ? `\`${node.text.replace(/`/g, '\\`')}\`` : '_None_'}\n\n`;
      
      if (node.children && node.children.length > 0) {
        md += `## Children (${node.children.length})\n\n`;
        node.children.forEach((id, index) => {
          md += `${index + 1}. \`${id}\`\n`;
        });
        md += `\n`;
      } else {
        md += `## Children\n\n_None_\n\n`;
      }
      
      if (node.properties && Object.keys(node.properties).length > 0) {
        md += `## Properties\n\n`;
        for (const [key, value] of Object.entries(node.properties)) {
          md += `**${key}**: ${JSON.stringify(value)}\n\n`;
        }
      }
      
      if (node.leadingComments && node.leadingComments.length > 0) {
        md += `## Leading Comments\n\n`;
        node.leadingComments.forEach((comment, index) => {
          const commentText = formatCommentForNode(comment);
          md += `${index + 1}. ${commentText}\n`;
        });
        md += `\n`;
      }
      
      if (node.trailingComments && node.trailingComments.length > 0) {
        md += `## Trailing Comments\n\n`;
        node.trailingComments.forEach((comment, index) => {
          const commentText = formatCommentForNode(comment);
          md += `${index + 1}. ${commentText}\n`;
        });
        md += `\n`;
      }
      
      outputContent = md;
    } else {
      // JSON/YAML format
      outputContent = formatQueryOutput(node, format);
    }

    // Output results
    await outputData(outputContent, options.output);

    if (options.verbose) {
      console.log(`Retrieved details for node ${nodeId} (${node.kindName})`);
      if (options.output) {
        console.log(`Results saved to: ${options.output}`);
      }
    }

  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), { verbose: options.verbose });
    process.exit(1);
  }
}

/**
 * Format comment object for node display
 */
function formatCommentForNode(comment: any): string {
  if (typeof comment === 'string') {
    return comment;
  }
  
  if (typeof comment === 'object' && comment !== null) {
    const text = comment.text || comment.content || String(comment);
    const kind = comment.kind;
    
    // Clean up comment delimiters and normalize whitespace
    let cleanText = text;
    if (kind === 'SingleLineCommentTrivia' || kind === 2) {
      cleanText = text.replace(/^\/\/\s*/, '').trim();
      return `// ${cleanText}`;
    } else if (kind === 'MultiLineCommentTrivia' || kind === 3) {
      if (text.trim().startsWith('/**')) {
        cleanText = text.trim().substring(3, text.trim().length - 2).trim();
        // Normalize multi-line JSDoc
        cleanText = cleanText.replace(/\s+/g, ' ').replace(/^\*+\s*/gm, '').trim();
        return `/** ${cleanText} */`;
      } else if (text.trim().startsWith('/*')) {
        cleanText = text.trim().substring(2, text.trim().length - 2).trim();
        // Normalize multi-line comment
        cleanText = cleanText.replace(/\s+/g, ' ').trim();
        return `/* ${cleanText} */`;
      }
    }
    
    return text;
  }
  
  return String(comment);
}
