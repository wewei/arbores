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

    // Output tree structure
    printNodeTree(ast, nodeId, 0);
  } catch (error) {
    console.error('Error reading AST file:', error);
    process.exit(1);
  }
}

function printNodeTree(ast: SourceFileAST, nodeId: string, depth: number, isLast: boolean = true, prefix: string = ''): void {
  const node = ast.nodes[nodeId];
  if (!node) return;

  const kindName = getSyntaxKindName(node.kind);
  const hasChildren = node.children && node.children.length > 0;
  
  // Print current node
  if (depth === 0) {
    console.log(`+ ${nodeId}: ${kindName}`);
  } else {
    const connector = isLast ? '\\' : '|';
    const nodeConnector = hasChildren ? '+' : '-';
    console.log(`${prefix}${connector}-${nodeConnector} ${nodeId}: ${kindName}`);
  }

  if (hasChildren) {
    const newPrefix = depth === 0 ? '  ' : prefix + (isLast ? '  ' : '| ') + ' ';
    
    node.children!.forEach((childId, index) => {
      const isLastChild = index === node.children!.length - 1;
      printNodeTree(ast, childId, depth + 1, isLastChild, newPrefix);
    });
  }
} 