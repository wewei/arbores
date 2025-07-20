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
    case 'table':
    default:
      // Table format is handled in each command specifically
      break;
  }
}

export async function parentsCommand(filePath: string, options: { node?: string, verbose?: boolean, format?: string }): Promise<void> {
  try {
    const content = await readFile(filePath);
    const format = getFormatFromPath(filePath);
    const ast: SourceFileAST = parseASTFile(content, format);
    const outputFormat = options.format || 'table';

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

    // Find parent nodes by searching all nodes for ones that have this node as a child
    const parentIds = findParentNodes(ast, nodeId);

    if (parentIds.length === 0) {
      if (outputFormat === 'table') {
        console.log('No parents found');
      } else {
        formatOutput({ parents: [] }, outputFormat);
      }
      return;
    }

    if (outputFormat === 'table') {
      // Output parents with their information
      parentIds.forEach(parentId => {
        const parentNode = ast.nodes[parentId];
        if (parentNode) {
          const kindName = getSyntaxKindName(parentNode.kind);
          if (options.verbose) {
            // Verbose: show detailed information about the parent
            console.log(`${parentId}: ${kindName}(${parentNode.kind})`);
            if (parentNode.text) {
              console.log(`  Text: "${parentNode.text}"`);
            }
            if (parentNode.properties) {
              console.log(`  Properties: ${JSON.stringify(parentNode.properties)}`);
            }
            if (parentNode.children) {
              console.log(`  Children: ${parentNode.children.length} child(ren)`);
            }
            console.log(); // Empty line for separation
          } else {
            // Simple: show "id: human readable kind"
            console.log(`${parentId}: ${kindName}`);
          }
        } else {
          console.log(`${parentId}: Unknown`);
        }
      });
    } else {
      // JSON/YAML format
      const result = {
        child_node_id: nodeId,
        parents: parentIds.map(parentId => {
          const parentNode = ast.nodes[parentId];
          return {
            id: parentId,
            kind: parentNode ? parentNode.kind : null,
            kind_name: parentNode ? getSyntaxKindName(parentNode.kind) : 'Unknown',
            text: parentNode?.text || null,
            properties: parentNode?.properties || null,
            children_count: parentNode?.children?.length || 0
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

function findParentNodes(ast: SourceFileAST, nodeId: string): string[] {
  const parents: string[] = [];
  
  for (const [parentId, parentNode] of Object.entries(ast.nodes)) {
    if (parentNode.children && parentNode.children.includes(nodeId)) {
      parents.push(parentId);
    }
  }
  
  return parents;
}
