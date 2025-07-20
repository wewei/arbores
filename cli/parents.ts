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

export async function parentsCommand(filePath: string, options: { node?: string, verbose?: boolean, format?: string }): Promise<void> {
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

    // Find parent nodes by searching all nodes for ones that have this node as a child
    const parentIds = findParentNodes(ast, nodeId);

    if (parentIds.length === 0) {
      if (isMarkdownFormat(outputFormat)) {
        console.log('No parents found');
      } else {
        formatOutput({ parents: [] }, outputFormat);
      }
      return;
    }

    if (isMarkdownFormat(outputFormat)) {
      if (options.verbose) {
        // Verbose markdown table format
        console.log('| Parent ID | Kind | Kind Name | Text | Properties | Children Count |');
        console.log('|-----------|------|-----------|------|------------|----------------|');
        parentIds.forEach(parentId => {
          const parentNode = ast.nodes[parentId];
          if (parentNode) {
            const kindName = getSyntaxKindName(parentNode.kind);
            const text = parentNode.text ? `\`${parentNode.text.replace(/`/g, '\\`')}\`` : '_None_';
            const properties = parentNode.properties ? `\`${JSON.stringify(parentNode.properties)}\`` : '_None_';
            const childrenCount = parentNode.children?.length || 0;
            console.log(`| \`${parentId}\` | ${parentNode.kind} | ${kindName} | ${text} | ${properties} | ${childrenCount} |`);
          } else {
            console.log(`| \`${parentId}\` | - | Unknown | _Missing_ | - | - |`);
          }
        });
      } else {
        // Simple markdown table format
        console.log('| Parent ID | Kind Name |');
        console.log('|-----------|-----------|');
        parentIds.forEach(parentId => {
          const parentNode = ast.nodes[parentId];
          if (parentNode) {
            const kindName = getSyntaxKindName(parentNode.kind);
            console.log(`| \`${parentId}\` | ${kindName} |`);
          } else {
            console.log(`| \`${parentId}\` | Unknown |`);
          }
        });
      }
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
