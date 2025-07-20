import type { SourceFileAST, ASTNode } from '../src/types';
import { getSyntaxKindName } from '../src/syntax-kind-names';
import { readFile, getFormatFromPath, parseASTFile } from '../src/utils';
import * as yaml from 'js-yaml';

// Format output utilities
function formatOutput(data: any, format: string): void {
  switch (format?.toLowerCase()) {
    case 'json':
      console.log(JSON.stringify(data, null, 2));
      break;
    case 'yaml':
    case 'yml':
      console.log(yaml.dump(data));
      break;
    case 'markdown':
    case 'md':
    default:
      // Markdown format is handled in each command specifically
      break;
  }
}

function isMarkdownFormat(format?: string): boolean {
  return !format || format.toLowerCase() === 'markdown' || format.toLowerCase() === 'md';
}

// Table formatting utilities
function formatMarkdownTable(headers: string[], rows: string[][]): void {
  if (headers.length === 0 || rows.length === 0) {
    return;
  }

  // Calculate maximum width for each column
  const columnWidths = headers.map((header, index) => {
    const headerWidth = header.length;
    const maxRowWidth = Math.max(...rows.map(row => (row[index] || '').length));
    return Math.max(headerWidth, maxRowWidth);
  });

  // Format header row
  const formattedHeaders = headers.map((header, index) => 
    header.padEnd(columnWidths[index] || 0)
  );
  console.log(`| ${formattedHeaders.join(' | ')} |`);

  // Format separator row
  const separators = columnWidths.map(width => '-'.repeat(width));
  console.log(`| ${separators.join(' | ')} |`);

  // Format data rows
  rows.forEach(row => {
    const formattedCells = headers.map((_, index) => 
      (row[index] || '').padEnd(columnWidths[index] || 0)
    );
    console.log(`| ${formattedCells.join(' | ')} |`);
  });
}

type QueryOptions = {
  latest?: boolean;
  verbose?: boolean;
  format?: string;
};

export async function rootsCommand(filePath: string, options: QueryOptions): Promise<void> {
  try {
    const content = await readFile(filePath);
    const format = getFormatFromPath(filePath);
    const ast: SourceFileAST = parseASTFile(content, format);
    const outputFormat = options.format || 'markdown';

    if (options.latest) {
      // Output only the latest version's root node ID
      const latestVersion = ast.versions[ast.versions.length - 1];
      if (latestVersion) {
        if (isMarkdownFormat(outputFormat)) {
          console.log(latestVersion.root_node_id);
        } else {
          const result = { root_node_id: latestVersion.root_node_id };
          formatOutput(result, outputFormat);
        }
      } else {
        console.error('No versions found in AST file');
        process.exit(1);
      }
    } else {
      // Output all root node IDs
      if (isMarkdownFormat(outputFormat)) {
        if (options.verbose) {
          // Markdown table format for verbose output
          const headers = ['Version', 'Root Node ID', 'Created At', 'Description'];
          const rows = ast.versions.map((version, index) => {
            const versionLabel = `v${index + 1}`;
            const timestamp = new Date(version.created_at).toLocaleString();
            const description = version.description || '_None_';
            return [versionLabel, `\`${version.root_node_id}\``, timestamp, description];
          });
          formatMarkdownTable(headers, rows);
        } else {
          // Simple list format
          ast.versions.forEach((version) => {
            console.log(version.root_node_id);
          });
        }
      } else {
        // JSON/YAML format
        const result = ast.versions.map((version, index) => ({
          version: `v${index + 1}`,
          root_node_id: version.root_node_id,
          created_at: version.created_at,
          description: version.description || null
        }));
        formatOutput(result, outputFormat);
      }
    }
  } catch (error) {
    console.error('Error reading AST file:', error);
    process.exit(1);
  }
}

export async function childrenCommand(filePath: string, options: { node?: string, format?: string }): Promise<void> {
  try {
    const content = await readFile(filePath);
    const format = getFormatFromPath(filePath);
    const ast: SourceFileAST = parseASTFile(content, format);
    const outputFormat = options.format || 'markdown';

    let nodeId = options.node;
    
    // If no node ID specified, use the latest version's root node
    if (!nodeId) {
      const latestVersion = ast.versions[ast.versions.length - 1];
      if (!latestVersion) {
        console.error('No versions found in AST file');
        process.exit(1);
      }
      nodeId = latestVersion.root_node_id;
    }

    const node = ast.nodes[nodeId];
    if (!node) {
      console.error(`Node with ID '${nodeId}' not found`);
      process.exit(1);
    }

    if (!node.children || node.children.length === 0) {
      if (isMarkdownFormat(outputFormat)) {
        console.log('No children found');
      } else {
        formatOutput({ children: [] }, outputFormat);
      }
      return;
    }

    if (isMarkdownFormat(outputFormat)) {
      // Markdown table format
      const headers = ['Child ID', 'Kind', 'Kind Name', 'Text'];
      const rows = node.children.map(childId => {
        const childNode = ast.nodes[childId];
        if (childNode) {
          const kindName = getSyntaxKindName(childNode.kind);
          const text = childNode.text ? `\`${childNode.text.replace(/`/g, '\\`')}\`` : '_None_';
          return [`\`${childId}\``, childNode.kind.toString(), kindName, text];
        } else {
          return [`\`${childId}\``, '-', 'Unknown', '_Missing_'];
        }
      });
      formatMarkdownTable(headers, rows);
    } else {
      // JSON/YAML format
      const result = {
        parent_node_id: nodeId,
        children: node.children.map(childId => {
          const childNode = ast.nodes[childId];
          return {
            id: childId,
            kind: childNode ? childNode.kind : null,
            kind_name: childNode ? getSyntaxKindName(childNode.kind) : 'Unknown',
            text: childNode?.text || null
          };
        })
      };
      formatOutput(result, outputFormat);
    }
  } catch (error) {
    console.error('Error reading AST file:', error);
    process.exit(1);
  }
}

export async function treeCommand(filePath: string, options: { node?: string, comments?: boolean }): Promise<void> {
  try {
    const content = await readFile(filePath);
    const format = getFormatFromPath(filePath);
    const ast: SourceFileAST = parseASTFile(content, format);

    // 如果没有提供 nodeId，使用 latest root
    let targetNodeId: string;
    if (!options.node) {
      const latestVersion = ast.versions[ast.versions.length - 1];
      if (!latestVersion) {
        throw new Error('No versions found in AST file');
      }
      targetNodeId = latestVersion.root_node_id;
    } else {
      targetNodeId = options.node;
    }

    const node = ast.nodes[targetNodeId];
    if (!node) {
      console.error(`Node with ID '${targetNodeId}' not found`);
      process.exit(1);
    }

    // Collect all tree lines
    const lines = printNodeTree(ast, targetNodeId, 0, true, '', [], options.comments);
    
    // Print aligned tree
    printAlignedTree(lines, options.comments);
  } catch (error) {
    console.error('Error reading AST file:', error);
    process.exit(1);
  }
}

// Get terminal width
function getTerminalWidth(): number {
  try {
    return process.stdout.columns || 80;
  } catch {
    return 80; // fallback width
  }
}

// Truncate text with ellipsis
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

// Check if node is a token node (has text)
function isTokenNode(kind: number): boolean {
  return kind >= 1 && kind <= 200; // Rough range for token kinds
}

// Tree line structure
type TreeLine = {
  baseLine: string;
  text?: string;
  depth: number;
  leadingComments?: import('../src/types').CommentInfo[];
  trailingComments?: import('../src/types').CommentInfo[];
  isComment?: boolean; // Flag to identify comment lines
  commentType?: string; // [//], [/*], [**] 
  commentText?: string;
};

function printNodeTree(
  ast: SourceFileAST, 
  nodeId: string, 
  depth: number, 
  isLast: boolean = true, 
  prefix: string = '', 
  lines: TreeLine[] = [],
  showComments: boolean = false
): TreeLine[] {
  const node = ast.nodes[nodeId];
  if (!node) return lines;

  const kindName = getSyntaxKindName(node.kind);
  const hasChildren = node.children && node.children.length > 0;
  const hasLeadingComments = showComments && node.leadingComments && node.leadingComments.length > 0;
  const hasTrailingComments = showComments && node.trailingComments && node.trailingComments.length > 0;
  
  // Calculate the base line content using format: "Type(code): hash-id"
  let baseLine: string;
  if (depth === 0) {
    baseLine = `${kindName}(${node.kind}): ${nodeId}`;
  } else {
    // Use beautiful Unicode box drawing characters
    const treeChar = isLast ? '└─' : '├─';
    baseLine = `${prefix}${treeChar} ${kindName}(${node.kind}): ${nodeId}`;
  }
  
  // Add line to array
  const line: TreeLine = {
    baseLine,
    depth
  };
  
  // Add text for token nodes
  if (node.text && isTokenNode(node.kind)) {
    line.text = node.text;
  }
  
  lines.push(line);

  // Now handle "children" in order: leading comments, actual children, trailing comments
  if (hasLeadingComments || hasChildren || hasTrailingComments) {
    const newPrefix = depth === 0 ? '' : prefix + (isLast ? '   ' : '│  ');
    let childIndex = 0;
    
    // Calculate total number of "children" (comments + actual children)
    const totalChildren = (hasLeadingComments ? node.leadingComments!.length : 0) +
                         (hasChildren ? node.children!.length : 0) +
                         (hasTrailingComments ? node.trailingComments!.length : 0);
    
    // 1. Process leading comments as first children
    if (hasLeadingComments) {
      node.leadingComments!.forEach((comment) => {
        const isLastChild = childIndex === totalChildren - 1;
        printCommentAsChild(comment, depth + 1, isLastChild, newPrefix, lines);
        childIndex++;
      });
    }
    
    // 2. Process actual children
    if (hasChildren) {
      node.children!.forEach((childId) => {
        const isLastChild = childIndex === totalChildren - 1;
        printNodeTree(ast, childId, depth + 1, isLastChild, newPrefix, lines, showComments);
        childIndex++;
      });
    }
    
    // 3. Process trailing comments as last children
    if (hasTrailingComments) {
      node.trailingComments!.forEach((comment) => {
        const isLastChild = childIndex === totalChildren - 1;
        printCommentAsChild(comment, depth + 1, isLastChild, newPrefix, lines);
        childIndex++;
      });
    }
  }
  
  return lines;
}

// Print a comment as a child node in the tree
function printCommentAsChild(
  comment: import('../src/types').CommentInfo,
  depth: number,
  isLast: boolean,
  prefix: string,
  lines: TreeLine[]
): void {
  const { type, text } = formatComment(comment);
  
  // Use tree characters just like regular nodes
  const treeChar = isLast ? '└─' : '├─';
  const baseLine = `${prefix}${treeChar} ${type}`;
  
  lines.push({
    baseLine,
    depth,
    isComment: true,
    commentType: type,
    commentText: text
  });
}

function printAlignedTree(lines: TreeLine[], showComments: boolean = false): void {
  const terminalWidth = getTerminalWidth();
  const minTextSpace = 8; // Minimum space needed for text display
  
  // Find the maximum base line length for non-comment lines only
  const nonCommentLines = lines.filter(line => !line.isComment);
  const maxBaseLineLength = nonCommentLines.length > 0 
    ? Math.max(...nonCommentLines.map(line => line.baseLine.length))
    : 0;
  
  // Calculate the aligned position for hash symbols (text display)
  const hashPosition = maxBaseLineLength + 2; // 2 spaces after the longest line
  
  // Check if we have enough space for text display
  const availableTextSpace = terminalWidth - hashPosition - 1; // 1 for space after hash
  const canDisplayText = availableTextSpace >= minTextSpace;
  
  // Print all lines
  lines.forEach(line => {
    let outputLine = line.baseLine;
    
    if (line.isComment && line.commentText) {
      // For comment lines, calculate available space based on current line length
      const availableSpace = terminalWidth - line.baseLine.length - 1; // 1 for space
      if (availableSpace > 8) {
        const truncatedComment = truncateText(line.commentText, availableSpace);
        outputLine = line.baseLine + ' ' + truncatedComment;
      }
    } else if (line.text && canDisplayText) {
      // For regular node lines with token text
      const padding = ' '.repeat(hashPosition - line.baseLine.length);
      const displayText = truncateText(line.text, availableTextSpace);
      outputLine = line.baseLine + padding + '# ' + displayText;
    }
    
    console.log(outputLine);
  });
  
  // Add warning if terminal is too narrow
  if (!canDisplayText && lines.some(line => line.text && !line.isComment)) {
    console.log('\nNote: Terminal width is limited. Some token text may not be displayed.');
  }
}

// Format comment for display
function formatComment(comment: import('../src/types').CommentInfo): { type: string, text: string } {
  let type: string;
  let text = comment.text;
  
  // Determine comment type and clean text
  if (comment.kind === 'SingleLineCommentTrivia') {
    type = '[//]';
    // Remove leading // and trim
    text = text.replace(/^\/\/\s*/, '').trim();
  } else if (comment.kind === 'MultiLineCommentTrivia') {
    // Check if it's JSDoc (starts with /** )
    if (text.trim().startsWith('/**')) {
      type = '[**]';
      // Remove /** */ and clean up JSDoc formatting
      text = text.replace(/^\/\*\*\s*/, '').replace(/\s*\*\/$/, '').trim();
      // Remove leading * from lines and join with spaces
      text = text.split(/\r?\n/).map(line => 
        line.replace(/^\s*\*\s?/, '').trim()
      ).filter(line => line.length > 0).join(' ').trim();
    } else {
      type = '[/*]';
      // Remove /* */ and clean up
      text = text.replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '').trim();
      // Replace multiple whitespace with single spaces
      text = text.replace(/\s+/g, ' ');
    }
  } else {
    type = '[??]';
  }
  
  return { type, text };
}

