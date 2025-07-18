import type { SourceFileAST, ASTNode } from '../src/types';
import { getSyntaxKindName } from '../src/syntax-kind-names';
import { readFile } from '../src/utils';

type QueryOptions = {
  latest?: boolean;
};

export async function rootCommand(filePath: string, options: QueryOptions): Promise<void> {
  try {
    const content = await readFile(filePath);
    const ast: SourceFileAST = JSON.parse(content);

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
      // Output all root node IDs
      ast.versions.forEach(version => {
        console.log(`${version.version_id}: ${version.root_node_id}`);
      });
    }
  } catch (error) {
    console.error('Error reading AST file:', error);
    process.exit(1);
  }
}

export async function childCommand(filePath: string, nodeId: string): Promise<void> {
  try {
    const content = await readFile(filePath);
    const ast: SourceFileAST = JSON.parse(content);

    const node = ast.nodes[nodeId];
    if (!node) {
      console.error(`Node with ID '${nodeId}' not found`);
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

export async function treeCommand(filePath: string, nodeId: string): Promise<void> {
  try {
    const content = await readFile(filePath);
    const ast: SourceFileAST = JSON.parse(content);

    const node = ast.nodes[nodeId];
    if (!node) {
      console.error(`Node with ID '${nodeId}' not found`);
      process.exit(1);
    }

    // Collect all tree lines
    const lines = printNodeTree(ast, nodeId, 0);
    
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
  
  // Calculate the aligned position for semicolons
  const semicolonPosition = maxBaseLineLength + 2; // 2 spaces after the longest line
  
  // Check if we have enough space for text display
  const availableTextSpace = terminalWidth - semicolonPosition - 1; // 1 for space after semicolon
  const canDisplayText = availableTextSpace >= minTextSpace;
  
  // Print all lines with aligned semicolons
  lines.forEach(line => {
    let outputLine = line.baseLine;
    
    if (line.text && canDisplayText) {
      // Pad the base line to align with semicolon position
      const padding = ' '.repeat(semicolonPosition - line.baseLine.length);
      const displayText = truncateText(line.text, availableTextSpace);
      outputLine = line.baseLine + padding + '; ' + displayText;
    }
    
    console.log(outputLine);
  });
  
  // Add warning if terminal is too narrow
  if (!canDisplayText) {
    console.log('\nNote: Terminal width is limited. Some token text may not be displayed.');
  }
} 