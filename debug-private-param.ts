#!/usr/bin/env bun

import { readFileSync } from 'fs';
import createNode from './src/ast-builder/index.ts';
import * as ts from 'typescript';

console.log('🔍 Debug private parameter test AST nodes...\n');

// 读取 AST 文件
const ast = JSON.parse(readFileSync('samples/private-param-test.ast.json', 'utf-8'));
const rootId = ast.versions[ast.versions.length - 1].root_node_id;

console.log(`Root node ID: ${rootId}\n`);

// 获取根节点并递归检查所有节点
function checkNode(nodeId: string, depth = 0): void {
  const node = ast.nodes[nodeId];
  if (!node) {
    console.log(`${'  '.repeat(depth)}❌ Node ${nodeId} not found!`);
    return;
  }

  const indent = '  '.repeat(depth);
  
  try {
    // 创建节点
    const tsNode = createNode<ts.Node>(ast, node);
    
    const kindName = ts.SyntaxKind[node.kind] || `Unknown(${node.kind})`;
    const tsKindName = ts.SyntaxKind[tsNode.kind] || `Unknown(${tsNode.kind})`;
    
    if (tsNode.kind === ts.SyntaxKind.Unknown) {
      console.log(`${indent}❌ Node ${nodeId}: ${kindName} (${node.kind}) -> Created: ${tsKindName} (${tsNode.kind}) UNKNOWN!`);
      if (node.text) {
        console.log(`${indent}   Text: "${node.text}"`);
      }
    } else {
      console.log(`${indent}✅ Node ${nodeId}: ${kindName} (${node.kind}) -> Created: ${tsKindName} (${tsNode.kind})`);
    }
    
    // 检查子节点
    if (node.children) {
      for (const childId of node.children) {
        checkNode(childId, depth + 1);
      }
    }
    
  } catch (error: any) {
    console.log(`${indent}💥 Failed to create node ${nodeId}: ${error.message}`);
  }
}

checkNode(rootId);
