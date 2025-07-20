import type { SourceFileAST, ASTNode } from '../src/types';
import { getSyntaxKindName } from '../src/syntax-kind-names';
import { readFile, getFormatFromPath, parseASTFile } from '../src/utils';
import * as yaml from 'js-yaml';

type NodeCommandOptions = {
  format?: string;
};

// Format output utilities
function formatOutput(data: any, format: string): void {
  switch (format?.toLowerCase()) {
    case 'json':
      console.log(JSON.stringify(data, null, 2));
      break;
    case 'yaml':
    case 'yml':
      console.log(yaml.dump(data, { indent: 2, lineWidth: -1 }));
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

export async function nodeCommand(filePath: string, nodeId: string, options: NodeCommandOptions): Promise<void> {
  try {
    const content = await readFile(filePath);
    const format = getFormatFromPath(filePath);
    const ast: SourceFileAST = parseASTFile(content, format);

    const node = ast.nodes[nodeId];
    if (!node) {
      console.error(`Node with ID '${nodeId}' not found`);
      process.exit(1);
    }

    // Find parent nodes by searching all nodes for ones that have this node as a child
    const parentIds = findParentNodes(ast, nodeId);
    const outputFormat = options.format || 'markdown';
    
    // Collect detailed information for parents and children based on format
    let parents: any[], children: any[];
    
    if (isMarkdownFormat(outputFormat)) {
      // For markdown format, include detailed node information
      parents = parentIds.map(id => {
        const parentNode = ast.nodes[id];
        if (!parentNode) {
          return { id, kind: 'Unknown', name: 'Unknown' };
        }
        return {
          id,
          kind: parentNode.kind,
          name: getSyntaxKindName(parentNode.kind)
        };
      });
      
      children = (node.children || []).map(id => {
        const childNode = ast.nodes[id];
        if (!childNode) {
          return { id, kind: 'Unknown', name: 'Unknown' };
        }
        return {
          id,
          kind: childNode.kind,
          name: getSyntaxKindName(childNode.kind)
        };
      });
    } else {
      // For JSON/YAML formats, keep simple ID arrays
      parents = parentIds;
      children = node.children || [];
    }

    const nodeInfo = {
      id: node.id,
      type: {
        name: getSyntaxKindName(node.kind),
        code: node.kind
      },
      text: node.text || null,
      leadingComments: node.leadingComments || [],
      trailingComments: node.trailingComments || [],
      children: children,
      parents: parents,
      properties: node.properties || null
    };

    if (isMarkdownFormat(outputFormat)) {
      printNodeInfoTable(nodeInfo);
    } else {
      formatOutput(nodeInfo, outputFormat);
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

function printNodeInfoTable(nodeInfo: any): void {
  console.log('Node Information');
  console.log('================');
  console.log();
  
  // Basic info
  console.log(`ID: ${nodeInfo.id}`);
  console.log(`Type: ${nodeInfo.type.name} (${nodeInfo.type.code})`);
  
  if (nodeInfo.text !== null) {
    console.log(`Text: "${nodeInfo.text}"`);
  }
  
  if (nodeInfo.properties) {
    console.log('Properties:');
    for (const [key, value] of Object.entries(nodeInfo.properties)) {
      console.log(`  ${key}: ${value}`);
    }
  }
  
  console.log();
  
  // Comments
  if (nodeInfo.leadingComments.length > 0) {
    console.log('Leading Comments:');
    nodeInfo.leadingComments.forEach((comment: any, index: number) => {
      const typeDisplay = getCommentTypeDisplayForFormatting(comment.text);
      console.log(`  ${index + 1}. [${typeDisplay}] ${formatCommentText(comment.text)}`);
    });
    console.log();
  }
  
  if (nodeInfo.trailingComments.length > 0) {
    console.log('Trailing Comments:');
    nodeInfo.trailingComments.forEach((comment: any, index: number) => {
      const typeDisplay = getCommentTypeDisplayForFormatting(comment.text);
      console.log(`  ${index + 1}. [${typeDisplay}] ${formatCommentText(comment.text)}`);
    });
    console.log();
  }
  
  // Relationships
  if (nodeInfo.parents.length > 0) {
    console.log(`Parents (${nodeInfo.parents.length}):`);
    nodeInfo.parents.forEach((parentInfo: any) => {
      console.log(`  ${parentInfo.id} (${parentInfo.kind}: ${parentInfo.name})`);
    });
    console.log();
  }
  
  if (nodeInfo.children.length > 0) {
    console.log(`Children (${nodeInfo.children.length}):`);
    nodeInfo.children.forEach((childInfo: any) => {
      console.log(`  ${childInfo.id} (${childInfo.kind}: ${childInfo.name})`);
    });
  } else {
    console.log('Children: None');
  }
}

function getCommentTypeDisplay(kind: string): string {
  switch (kind) {
    case 'SingleLineCommentTrivia':
      return '//';
    case 'MultiLineCommentTrivia':
      return '/*';
    default:
      return '??';
  }
}

function formatCommentText(text: string): string {
  // Clean up comment markers and normalize whitespace
  let cleaned = text;
  
  if (text.startsWith('//')) {
    cleaned = text.substring(2).trim();
  } else if (text.startsWith('/*') && text.endsWith('*/')) {
    // Check if it's JSDoc (starts with /** )
    if (text.startsWith('/**')) {
      // Remove /** */ and clean up JSDoc formatting
      cleaned = text.substring(3, text.length - 2).trim();
      // Remove leading * from each line for JSDoc
      cleaned = cleaned.split(/\r?\n/)
        .map(line => line.replace(/^\s*\*\s?/, '').trim())
        .filter(line => line.length > 0)
        .join(' ')
        .trim();
    } else {
      // Regular multi-line comment
      cleaned = text.substring(2, text.length - 2).trim();
      // Replace newlines with spaces for multi-line comments
      cleaned = cleaned.replace(/\s+/g, ' ');
    }
  }
  
  // Replace multiple whitespaces with single space
  return cleaned.replace(/\s+/g, ' ');
}

// Update the display to show [**] for JSDoc comments
function getCommentTypeDisplayForFormatting(text: string): string {
  if (text.startsWith('/**')) {
    return '**';
  } else if (text.startsWith('/*')) {
    return '/*';
  } else if (text.startsWith('//')) {
    return '//';
  } else {
    return '??';
  }
}
