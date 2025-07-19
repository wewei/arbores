import type { SourceFileAST, ASTNode } from '../src/types';
import { getSyntaxKindName } from '../src/syntax-kind-names';
import { readFile, getFormatFromPath, parseASTFile } from '../src/utils';

type QueryOptions = {
  latest?: boolean;
};

export async function rootCommand(filePath: string, options: QueryOptions): Promise<void> {
  try {
    const content = await readFile(filePath);
    const format = getFormatFromPath(filePath);
    const ast: SourceFileAST = parseASTFile(content, format);

    if (options.latest) {
      // Output only the latest version's root node ID
      const latestVersion = ast.versions[ast.versions.length - 1];
      if (latestVersion) {
        console.log(latestVersion.root_node_id);
      } else {
        console.error('No versions found in AST file');
        process.exit(1);
      }
    } else {
      // Output all root node IDs with timestamps
      ast.versions.forEach((version, index) => {
        const versionLabel = `v${index + 1}`;
        const timestamp = new Date(version.created_at).toLocaleString();
        const description = version.description ? ` (${version.description})` : '';
        console.log(`${versionLabel} [${timestamp}]${description}: ${version.root_node_id}`);
      });
    }
  } catch (error) {
    console.error('Error reading AST file:', error);
    process.exit(1);
  }
}

export async function childCommand(filePath: string, options: { node?: string }): Promise<void> {
  try {
    const content = await readFile(filePath);
    const format = getFormatFromPath(filePath);
    const ast: SourceFileAST = parseASTFile(content, format);

    if (!options.node) {
      console.error('Node ID is required');
      process.exit(1);
    }

    const node = ast.nodes[options.node];
    if (!node) {
      console.error(`Node with ID '${options.node}' not found`);
      process.exit(1);
    }

    if (!node.children || node.children.length === 0) {
      console.log('No children found');
      return;
    }

    // Output children as "id: human readable kind"
    node.children.forEach(childId => {
      const childNode = ast.nodes[childId];
      if (childNode) {
        const kindName = getSyntaxKindName(childNode.kind);
        console.log(`${childId}: ${kindName}`);
      } else {
        console.log(`${childId}: Unknown`);
      }
    });
  } catch (error) {
    console.error('Error reading AST file:', error);
    process.exit(1);
  }
}

export async function treeCommand(filePath: string, options: { node?: string }): Promise<void> {
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
    const lines = printNodeTree(ast, targetNodeId, 0);
    
    // Print aligned tree
    printAlignedTree(lines);
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
};

function printNodeTree(ast: SourceFileAST, nodeId: string, depth: number, isLast: boolean = true, prefix: string = '', lines: TreeLine[] = []): TreeLine[] {
  const node = ast.nodes[nodeId];
  if (!node) return lines;

  const kindName = getSyntaxKindName(node.kind);
  const hasChildren = node.children && node.children.length > 0;
  
  // Calculate the base line content (without text)
  const baseLine = depth === 0 
    ? `${nodeId}: ${kindName}`
    : `${prefix}${isLast ? '\\' : '|'}- ${nodeId}: ${kindName}`;
  
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

  if (hasChildren) {
    const newPrefix = depth === 0 ? '' : prefix + (isLast ? '  ' : '| ') + ' ';
    
    node.children!.forEach((childId, index) => {
      const isLastChild = index === node.children!.length - 1;
      printNodeTree(ast, childId, depth + 1, isLastChild, newPrefix, lines);
    });
  }
  
  return lines;
}

function printAlignedTree(lines: TreeLine[]): void {
  const terminalWidth = getTerminalWidth();
  const minTextSpace = 8; // Minimum space needed for text display
  
  // Find the maximum base line length
  const maxBaseLineLength = Math.max(...lines.map(line => line.baseLine.length));
  
  // Calculate the aligned position for hash symbols
  const hashPosition = maxBaseLineLength + 2; // 2 spaces after the longest line
  
  // Check if we have enough space for text display
  const availableTextSpace = terminalWidth - hashPosition - 1; // 1 for space after hash
  const canDisplayText = availableTextSpace >= minTextSpace;
  
  // Print all lines with aligned hash symbols
  lines.forEach(line => {
    let outputLine = line.baseLine;
    
    if (line.text && canDisplayText) {
      // Pad the base line to align with hash position
      const padding = ' '.repeat(hashPosition - line.baseLine.length);
      const displayText = truncateText(line.text, availableTextSpace);
      outputLine = line.baseLine + padding + '# ' + displayText;
    }
    
    console.log(outputLine);
  });
  
  // Add warning if terminal is too narrow
  if (!canDisplayText) {
    console.log('\nNote: Terminal width is limited. Some token text may not be displayed.');
  }
} 