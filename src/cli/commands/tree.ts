/**
 * Tree Command - Display tree structure of a node from AST file
 */

import { getNode, getLatestRoot } from '../../core';
import { getSyntaxKindName } from '../../core/syntax-kind-names';
import { 
  readFile, 
  fileExists, 
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
 * Tree line structure for aligned output
 */
interface TreeLine {
  prefix: string;     // Tree structure prefix (├──, └──, etc.)
  content: string;    // Node type and kind info
  text?: string;      // Node text content (optional)
  isComment?: boolean; // Whether this is a comment line
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

    // Collect all tree lines
    const lines: TreeLine[] = [];
    collectNodeTree(ast, nodeId, 0, true, '', lines, options.comments || false);
    
    // Print aligned tree
    printAlignedTree(lines);

    if (options.verbose) {
      console.log(`\nDisplayed tree structure for node ${nodeId}`);
    }

  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), { verbose: options.verbose });
    process.exit(1);
  }
}

/**
 * Collect node tree lines recursively
 */
function collectNodeTree(
  ast: any,
  nodeId: string,
  depth: number,
  isLast: boolean,
  prefix: string,
  lines: TreeLine[],
  showComments: boolean
): void {
  const node = ast.nodes[nodeId];
  if (!node) {
    lines.push({
      prefix: prefix + (isLast ? '└── ' : '├── '),
      content: `❌ Missing node: ${nodeId}`,
      text: undefined
    });
    return;
  }

  const kindName = getSyntaxKindName(node.kind);
  const content = `${kindName} (${node.kind})`;
  const text = node.text || undefined;
  
  lines.push({
    prefix: prefix + (isLast ? '└── ' : '├── '),
    content,
    text,
    isComment: false
  });
  
  // Show comments if requested
  const hasChildren = node.children && node.children.length > 0;
  const hasTrailingComments = showComments && node.trailingComments && node.trailingComments.length > 0;
  
  if (showComments) {
    // Add leading comments as first children
    if (node.leadingComments && node.leadingComments.length > 0) {
      const commentPrefix = prefix + (isLast ? '    ' : '│   ');
      node.leadingComments.forEach((comment: any) => {
        const commentText = formatComment(comment);
        lines.push({
          prefix: commentPrefix + '├── ',
          content: commentText,
          text: undefined,
          isComment: true
        });
      });
    }
  }
  
  // Process children
  if (hasChildren) {
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    node.children.forEach((childId: string, index: number) => {
      const isLastChild = index === node.children.length - 1 && !hasTrailingComments;
      collectNodeTree(ast, childId, depth + 1, isLastChild, childPrefix, lines, showComments);
    });
  }
  
  // Show trailing comments as last children if requested
  if (hasTrailingComments) {
    const commentPrefix = prefix + (isLast ? '    ' : '│   ');
    node.trailingComments.forEach((comment: any, index: number) => {
      const isLastComment = index === node.trailingComments.length - 1;
      const commentText = formatComment(comment);
      lines.push({
        prefix: commentPrefix + (isLastComment ? '└── ' : '├── '),
        content: commentText,
        text: undefined,
        isComment: true
      });
    });
  }
}

/**
 * Print aligned tree with proper text positioning
 */
function printAlignedTree(lines: TreeLine[]): void {
  const terminalWidth = getTerminalWidth();
  
  // Calculate the maximum width of prefix + content for alignment, but only for lines with text (non-comments)
  const linesWithText = lines.filter(line => line.text && !line.isComment);
  const maxPrefixContentWidth = linesWithText.length > 0 
    ? Math.max(...linesWithText.map(line => (line.prefix + line.content).length))
    : 0;
  
  // Add some padding for better readability
  const textStartColumn = maxPrefixContentWidth + 2;
  
  // Print each line with aligned text
  lines.forEach(line => {
    let prefixContent = line.prefix + line.content;
    
    if (line.text && !line.isComment) {
      // Calculate available space for text
      const availableSpace = terminalWidth - textStartColumn;
      let displayText = line.text;
      
      // Normalize text by replacing newlines and multiple whitespace with single space
      displayText = displayText.replace(/\s+/g, ' ').trim();
      
      // Truncate text if it's too long
      if (availableSpace > 0 && displayText.length > availableSpace) {
        displayText = displayText.substring(0, availableSpace - 3) + '...';
      }
      
      // Format with proper spacing and # prefix with space (no quotes)
      const padding = ' '.repeat(Math.max(0, textStartColumn - prefixContent.length));
      console.log(`${prefixContent}${padding}# ${displayText}`);
    } else {
      // Truncate comments if they're too long
      if (line.isComment && prefixContent.length > terminalWidth) {
        prefixContent = prefixContent.substring(0, terminalWidth - 3) + '...';
      }
      console.log(prefixContent);
    }
  });
}

/**
 * Format comment with appropriate prefix
 */
function formatComment(comment: any): string {
  if (typeof comment === 'string') {
    // Simple string comment - determine type by content
    const trimmed = comment.trim();
    if (trimmed.startsWith('/**')) {
      const content = trimmed.substring(3, trimmed.length - 2).trim();
      const normalized = normalizeMultilineComment(content);
      return `[**] ${normalized}`;
    } else if (trimmed.startsWith('/*')) {
      const content = trimmed.substring(2, trimmed.length - 2).trim();
      const normalized = normalizeMultilineComment(content);
      return `[/*] ${normalized}`;
    } else if (trimmed.startsWith('//')) {
      const content = trimmed.substring(2).trim();
      return `[//] ${content}`;
    } else {
      return `[//] ${trimmed}`;
    }
  } else if (typeof comment === 'object' && comment !== null) {
    // Comment object with type information
    const text = comment.text || comment.content || String(comment);
    const kind = comment.kind;
    
    // Determine comment type based on kind or content
    if (kind === 2 || kind === 'SingleLineCommentTrivia') { // SingleLineCommentTrivia
      const content = text.replace(/^\/\/\s*/, '').trim();
      return `[//] ${content}`;
    } else if (kind === 3 || kind === 'MultiLineCommentTrivia') { // MultiLineCommentTrivia
      const trimmed = text.trim();
      let content: string;
      let prefix: string;
      
      if (trimmed.startsWith('/**')) {
        content = trimmed.substring(3, trimmed.length - 2).trim();
        prefix = '[**]';
      } else if (trimmed.startsWith('/*')) {
        content = trimmed.substring(2, trimmed.length - 2).trim();
        prefix = '[/*]';
      } else {
        content = trimmed;
        prefix = '[/*]';
      }
      
      const normalized = normalizeMultilineComment(content);
      return `${prefix} ${normalized}`;
    } else {
      // Fallback
      const content = text.replace(/^\/\/\s*/, '').trim();
      return `[//] ${content}`;
    }
  }
  
  return `[//] ${String(comment)}`;
}

/**
 * Normalize multi-line comment content by replacing newlines and extra whitespace with single spaces
 */
function normalizeMultilineComment(content: string): string {
  return content
    .replace(/\n/g, ' ')           // Replace newlines with spaces
    .replace(/\r/g, ' ')           // Replace carriage returns with spaces
    .replace(/\s+/g, ' ')          // Replace multiple whitespace with single space
    .replace(/^\*+\s*/gm, '')      // Remove leading asterisks and spaces (JSDoc style)
    .trim();                       // Remove leading/trailing whitespace
}

/**
 * Extract comment text from comment object
 */
function getCommentText(comment: any): string {
  if (typeof comment === 'string') {
    return comment;
  }
  
  if (comment && typeof comment === 'object') {
    return comment.text || comment.content || comment.value || String(comment);
  }
  
  return String(comment);
}

/**
 * Determine comment type based on comment object
 */
function getCommentType(comment: any): string {
  if (typeof comment === 'string') {
    // Simple string comment, default to line comment
    return '[//]';
  }
  
  if (comment && typeof comment === 'object') {
    // Check for comment type indicators
    if (comment.kind) {
      // TypeScript comment kinds
      switch (comment.kind) {
        case 2: // SingleLineCommentTrivia
          return '[//]';
        case 3: // MultiLineCommentTrivia
          return '[/*]';
        default:
          return '[//]';
      }
    }
    
    // Check for JSDoc indicators
    if (comment.text && (comment.text.includes('/**') || comment.text.includes('@'))) {
      return '[**]';
    }
    
    // Check text content for type hints
    const text = comment.text || comment.content || comment.value || '';
    if (text.includes('/**') || text.startsWith('*') || text.includes('@param') || text.includes('@return')) {
      return '[**]';
    }
    
    if (text.includes('/*') && text.includes('*/')) {
      return '[/*]';
    }
  }
  
  // Default to line comment
  return '[//]';
}

/**
 * Get terminal width
 */
function getTerminalWidth(): number {
  try {
    return process.stdout.columns || 80;
  } catch {
    return 80; // fallback width
  }
}
