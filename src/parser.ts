import * as ts from 'typescript';
import type { ASTNode, FileVersion, SourceFileAST } from './types';
import { generateNodeId, isTokenNode, extractNodeProperties } from './utils';

// 处理节点（支持复用）
function processNode(
  node: ts.Node, 
  nodes: Record<string, ASTNode>
): string {
  const nodeId = generateNodeId(node);
  
  // 检查节点是否已存在
  if (nodes[nodeId]) {
    return nodeId;
  }
  
  // 创建新节点
  const children = node.getChildren();
  const childIds = children.map(child => processNode(child, nodes));
  
  const astNode: ASTNode = {
    id: nodeId,
    kind: node.kind,
    text: isTokenNode(node.kind) ? node.getText() : undefined,
    properties: extractNodeProperties(node),
    children: childIds.length > 0 ? childIds : undefined
  };
  
  nodes[nodeId] = astNode;
  return nodeId;
}

// 解析 TypeScript 文件到 AST
export function parseTypeScriptFile(
  filePath: string, 
  sourceText: string
): SourceFileAST {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );
  
  const nodes: Record<string, ASTNode> = {};
  const rootNodeId = processNode(sourceFile, nodes);
  
  const version: FileVersion = {
    created_at: new Date().toISOString(),
    root_node_id: rootNodeId
  };
  
  return {
    file_name: filePath,
    versions: [version],
    nodes
  };
}

// 合并新的 AST 到现有文件
export function mergeAST(
  existingAST: SourceFileAST,
  newSourceFile: ts.SourceFile,
  description?: string
): SourceFileAST {
  const newNodes: Record<string, ASTNode> = { ...existingAST.nodes };
  const newRootNodeId = processNode(newSourceFile, newNodes);
  
  // 检查是否已有相同的根节点ID
  const existingVersion = existingAST.versions.find(v => v.root_node_id === newRootNodeId);
  
  if (existingVersion && !description) {
    // 如果已存在相同的根节点且没有新描述，直接返回现有数据
    console.log('No structural changes detected, skipping version creation');
    return existingAST;
  }
  
  const newVersion: FileVersion = {
    created_at: new Date().toISOString(),
    root_node_id: newRootNodeId,
    description
  };
  
  return {
    file_name: existingAST.file_name,
    versions: [...existingAST.versions, newVersion],
    nodes: newNodes
  };
}

// 从文件路径解析 AST
export async function parseFile(filePath: string): Promise<SourceFileAST> {
  const { readFile } = await import('./utils');
  const sourceText = await readFile(filePath);
  return parseTypeScriptFile(filePath, sourceText);
} 