#!/usr/bin/env bun

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

// 顶级节点列表
const topLevelNodes = [
  { id: '3f184b54845b011f', type: 'TypeAliasDeclaration', name: 'NonNullable' },
  { id: '87dbdcc3764660aa', type: 'InterfaceDeclaration', name: 'Person' },
  { id: 'f45007b8cddff446', type: 'TypeAliasDeclaration', name: 'PersonName' },
  { id: 'cb9055e963375444', type: 'TypeAliasDeclaration', name: 'AddressType' },
  { id: '181c5acc99df863d', type: 'FunctionDeclaration', name: 'isString' },
  { id: 'e42792f4e88d323a', type: 'FunctionDeclaration', name: 'isNumber' },
  { id: 'a82e8d15a89e193f', type: 'FunctionDeclaration', name: 'getValue (1)' },
  { id: 'e735a55e45e7f158', type: 'FunctionDeclaration', name: 'getValue (2)' },
  { id: '0b89c17becffccc9', type: 'FunctionDeclaration', name: 'getValue (impl)' },
  { id: '943a6e86a551bc48', type: 'ClassDeclaration', name: 'Container' },
  { id: 'f694c3f8fb643a3b', type: 'ClassDeclaration', name: 'Shape' },
  { id: '5c4b9c3aac585050', type: 'ClassDeclaration', name: 'Circle' },
  { id: '545204d02917af2f', type: 'EnumDeclaration', name: 'Color' },
  { id: '9f8ad7d7566b5158', type: 'EnumDeclaration', name: 'Direction' },
  { id: '85297717c9fe7829', type: 'ModuleDeclaration', name: 'Geometry' },
  { id: '79304d5b1d6cb28a', type: 'FirstStatement', name: 'point1' },
  { id: '26c437148cf31b4c', type: 'FirstStatement', name: 'point2' },
  { id: 'bdca13055ac694c1', type: 'FirstStatement', name: 'dist' }
];

console.log('🔍 Testing each subtree for stringification errors...\n');

// 读取完整的 AST
const fullAST = JSON.parse(readFileSync('samples/advanced-typescript.ast.json', 'utf-8'));

for (const node of topLevelNodes) {
  console.log(`📊 Testing ${node.name} (${node.type}) - ID: ${node.id}`);
  
  try {
    // 创建一个只包含当前节点的 AST
    const nodeData = fullAST.nodes[node.id];
    if (!nodeData) {
      console.log(`❌ Node ${node.id} not found in AST`);
      continue;
    }

    // 递归获取所有子节点
    function getAllDescendants(nodeId: string, visited = new Set<string>()): Set<string> {
      if (visited.has(nodeId)) return visited;
      visited.add(nodeId);
      
      const node = fullAST.nodes[nodeId];
      if (node && node.children) {
        for (const childId of node.children) {
          getAllDescendants(childId, visited);
        }
      }
      
      return visited;
    }

    const allNodeIds = getAllDescendants(node.id);
    console.log(`  📦 Collecting ${allNodeIds.size} nodes...`);

    // 构建子树 AST
    const subtreeAST = {
      file_name: `subtree-${node.id}.ts`,
      versions: [{
        created_at: new Date().toISOString(),
        root_node_id: node.id
      }],
      nodes: {} as any
    };

    for (const nodeId of allNodeIds) {
      if (fullAST.nodes[nodeId]) {
        subtreeAST.nodes[nodeId] = fullAST.nodes[nodeId];
      }
    }

    // 写入临时 AST 文件
    const tempFile = `temp-subtree-${node.id}.ast.json`;
    writeFileSync(tempFile, JSON.stringify(subtreeAST, null, 2));

    // 尝试 stringify
    const result = execSync(`bun run cli stringify ${tempFile}`, { encoding: 'utf-8', timeout: 5000 });
    console.log(`  ✅ Success! Generated code:\n${result.trim()}\n`);

    // 清理临时文件
    execSync(`rm ${tempFile}`);

  } catch (error: any) {
    console.log(`  ❌ Error: ${error.message}`);
    if (error.stdout) {
      console.log(`  📄 stdout: ${error.stdout}`);
    }
    if (error.stderr) {
      console.log(`  📄 stderr: ${error.stderr}`);
    }
    console.log('');
  }
}

console.log('🎯 Debug complete!');
