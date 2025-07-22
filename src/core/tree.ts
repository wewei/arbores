/**
 * Tree Rendering API - Core tree visualization functionality
 * 
 * This module provides pure functions for rendering AST nodes as tree structures.
 * The output is an array of strings that can be displayed or further processed.
 */

import type { 
  SourceFileAST, 
  ASTNode, 
  TreeRenderOptions, 
  TreeLine, 
  Result
} from './types';
import { success, error } from './types';
import { getSyntaxKindName } from './syntax-kind-names';

/**
 * Default tree rendering options
 */
const DEFAULT_OPTIONS: Required<TreeRenderOptions> = {
  maxWidth: 120,
  showComments: false,
  showText: true,
  showNodeIds: false,
  textPrefix: '# '
};

/**
 * Render an AST node as a tree structure
 * @param ast - The AST containing the nodes
 * @param nodeId - The root node ID to render
 * @param options - Rendering options
 * @returns Array of strings representing tree lines
 */
export function renderTree(
  ast: SourceFileAST,
  nodeId: string,
  options: TreeRenderOptions = {}
): Result<string[]> {
  try {
    // Validate inputs
    if (!ast || !ast.nodes) {
      return error('INVALID_AST', 'AST is missing or has no nodes');
    }
    
    if (!nodeId) {
      return error('INVALID_ARGUMENT', 'Node ID is required');
    }
    
    const rootNode = ast.nodes[nodeId];
    if (!rootNode) {
      return error('NODE_NOT_FOUND', `Node with ID '${nodeId}' not found`);
    }
    
    // Merge options with defaults
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Collect tree lines
    const lines: TreeLine[] = [];
    collectNodeTree(ast, nodeId, 0, true, '', lines, opts);
    
    // Convert tree lines to formatted strings
    const formattedLines = formatTreeLines(lines, opts);
    
    return success(formattedLines);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return error('STRINGIFY_FAILED', `Failed to render tree: ${message}`);
  }
}

/**
 * Render tree with default CLI options 
 * Convenience function for CLI usage
 */
export function renderTreeForCLI(
  ast: SourceFileAST,
  nodeId: string,
  showComments: boolean = false,
  maxWidth?: number
): Result<string[]> {
  const options: TreeRenderOptions = {
    maxWidth: maxWidth || 120,
    showComments,
    showText: true,
    showNodeIds: false,
    textPrefix: '# '
  };
  
  return renderTree(ast, nodeId, options);
}

/**
 * Recursively collect tree structure lines
 */
function collectNodeTree(
  ast: SourceFileAST,
  nodeId: string,
  depth: number,
  isLast: boolean,
  prefix: string,
  lines: TreeLine[],
  options: Required<TreeRenderOptions>
): void {
  const node = ast.nodes[nodeId];
  if (!node) {
    lines.push({
      prefix: prefix + (isLast ? '└── ' : '├── '),
      content: `❌ Missing node: ${nodeId}`,
      text: undefined,
      isComment: false,
      nodeId: options.showNodeIds ? nodeId : undefined
    });
    return;
  }

  // Create main node line
  const kindName = getSyntaxKindName(node.kind);
  let content = `${kindName} (${node.kind})`;
  
  if (options.showNodeIds) {
    content += ` [${nodeId}]`;
  }
  
  const text = options.showText && node.text ? node.text : undefined;
  
  lines.push({
    prefix: prefix + (isLast ? '└── ' : '├── '),
    content,
    text,
    isComment: false,
    nodeId: options.showNodeIds ? nodeId : undefined
  });
  
  // Determine what children we have
  const hasChildren = node.children && node.children.length > 0;
  const hasTrailingComments = options.showComments && 
    node.trailingComments && node.trailingComments.length > 0;
  
  // Add leading comments as first children
  if (options.showComments && node.leadingComments && node.leadingComments.length > 0) {
    const commentPrefix = prefix + (isLast ? '    ' : '│   ');
    node.leadingComments.forEach((comment) => {
      const commentText = formatComment(comment);
      lines.push({
        prefix: commentPrefix + '├── ',
        content: commentText,
        text: undefined,
        isComment: true,
        nodeId: undefined
      });
    });
  }
  
  // Process children
  if (hasChildren && node.children) {
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    node.children.forEach((childId: string, index: number) => {
      const isLastChild = index === node.children!.length - 1 && !hasTrailingComments;
      collectNodeTree(ast, childId, depth + 1, isLastChild, childPrefix, lines, options);
    });
  }
  
  // Add trailing comments as last children
  if (hasTrailingComments) {
    const commentPrefix = prefix + (isLast ? '    ' : '│   ');
    node.trailingComments!.forEach((comment, index) => {
      const isLastComment = index === node.trailingComments!.length - 1;
      const commentText = formatComment(comment);
      lines.push({
        prefix: commentPrefix + (isLastComment ? '└── ' : '├── '),
        content: commentText,
        text: undefined,
        isComment: true,
        nodeId: undefined
      });
    });
  }
}

/**
 * Format tree lines into strings with proper alignment and truncation
 */
function formatTreeLines(
  lines: TreeLine[], 
  options: Required<TreeRenderOptions>
): string[] {
  const result: string[] = [];
  
  // Calculate the maximum width of prefix + content for alignment (only for lines with text)
  const linesWithText = lines.filter(line => line.text && !line.isComment);
  const maxPrefixContentWidth = linesWithText.length > 0 
    ? Math.max(...linesWithText.map(line => (line.prefix + line.content).length))
    : 0;
  
  // Add padding for better readability
  const textStartColumn = maxPrefixContentWidth + 2;
  
  // Format each line
  lines.forEach(line => {
    let prefixContent = line.prefix + line.content;
    
    if (line.text && !line.isComment && options.showText) {
      // Calculate available space for text
      const availableSpace = options.maxWidth - textStartColumn;
      let displayText = line.text;
      
      // Normalize text by replacing newlines and multiple whitespace with single space
      displayText = normalizeText(displayText);
      
      // Truncate text if it's too long
      if (availableSpace > 0 && displayText.length > availableSpace) {
        displayText = displayText.substring(0, availableSpace - 3) + '...';
      }
      
      // Format with proper spacing and text prefix
      const padding = ' '.repeat(Math.max(0, textStartColumn - prefixContent.length));
      result.push(`${prefixContent}${padding}${options.textPrefix}${displayText}`);
    } else {
      // Truncate comments if they're too long
      if (line.isComment && prefixContent.length > options.maxWidth) {
        prefixContent = prefixContent.substring(0, options.maxWidth - 3) + '...';
      }
      result.push(prefixContent);
    }
  });
  
  return result;
}

/**
 * Format comment with appropriate type indicator
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
    if (kind === 2 || kind === 'SingleLineCommentTrivia') {
      const content = text.replace(/^\/\/\s*/, '').trim();
      return `[//] ${content}`;
    } else if (kind === 3 || kind === 'MultiLineCommentTrivia') {
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
 * Normalize text content by replacing newlines and extra whitespace
 */
function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
    .trim();               // Remove leading/trailing whitespace
}

/**
 * Normalize multi-line comment content
 */
function normalizeMultilineComment(content: string): string {
  return content
    .replace(/\n/g, ' ')           // Replace newlines with spaces
    .replace(/\r/g, ' ')           // Replace carriage returns with spaces
    .replace(/\s+/g, ' ')          // Replace multiple whitespace with single space
    .replace(/^\*+\s*/gm, '')      // Remove leading asterisks and spaces (JSDoc style)
    .trim();                       // Remove leading/trailing whitespace
}
