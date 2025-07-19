import * as ts from 'typescript';
import { createNode } from './src/ast-builder';
import type { SourceFileAST } from './src/types';
import { readFile } from './src/utils';

async function debugNodes() {
  const content = await readFile('samples/advanced-typescript.ast.json');
  const ast: SourceFileAST = JSON.parse(content);
  
  // 找到根节点
  const latestVersion = ast.versions[ast.versions.length - 1];
  if (!latestVersion) {
    throw new Error('No versions found');
  }
  
  const rootNodeId = latestVersion.root_node_id;
  console.log(`Root node ID: ${rootNodeId}`);
  
  // 递归检查每个节点
  function checkNode(nodeId: string, depth = 0): void {
    const node = ast.nodes[nodeId];
    if (!node) {
      console.log(`${' '.repeat(depth)}Missing node: ${nodeId}`);
      return;
    }
    
    const indent = ' '.repeat(depth);
    console.log(`${indent}Node ${nodeId}: ${ts.SyntaxKind[node.kind]} (${node.kind})`);
    
    try {
      const tsNode = createNode(ast, node);
      if (tsNode.kind === ts.SyntaxKind.Unknown) {
        console.log(`${indent}  ⚠️ Created node has Unknown kind!`);
      } else {
        console.log(`${indent}  ✅ Created: ${ts.SyntaxKind[tsNode.kind]} (${tsNode.kind})`);
      }
    } catch (error) {
      console.log(`${indent}  ❌ Error: ${error}`);
    }
    
    // 如果深度小于5，继续检查子节点
    if (depth < 5 && node.children) {
      for (const childId of node.children) {
        checkNode(childId, depth + 1);
      }
    }
  }
  
  checkNode(rootNodeId);
}

debugNodes().catch(console.error);
