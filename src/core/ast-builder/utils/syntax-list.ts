import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn } from '../types';

/**
 * 递归展开 SyntaxList 包装器，返回所有非 SyntaxList 的子节点
 * 
 * SyntaxList 是 TypeScript AST 中的特殊包装器节点，通常包含其他节点的列表。
 * 这个函数会递归地展开这些包装器，返回实际的内容节点。
 */
export function flattenSyntaxLists(
  children: string[],
  sourceFile: SourceFileAST
): ASTNode[] {
  const result: ASTNode[] = [];
  
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (!child) continue;
    
    if (child.kind === ts.SyntaxKind.SyntaxList) {
      // 递归展开 SyntaxList 中的子节点
      if (child.children) {
        const nested = flattenSyntaxLists(child.children, sourceFile);
        result.push(...nested);
      }
    } else {
      // 非 SyntaxList 节点直接添加
      result.push(child);
    }
  }
  
  return result;
}

/**
 * 从子节点列表中查找并展开第一个 SyntaxList
 * 如果没有找到 SyntaxList，返回所有子节点
 */
export function extractFromSyntaxList(
  children: string[],
  sourceFile: SourceFileAST
): ASTNode[] {
  // 首先查找是否有 SyntaxList
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (child && child.kind === ts.SyntaxKind.SyntaxList && child.children) {
      return flattenSyntaxLists(child.children, sourceFile);
    }
  }
  
  // 如果没有找到 SyntaxList，返回所有非空子节点
  const result: ASTNode[] = [];
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (child) {
      result.push(child);
    }
  }
  return result;
}

/**
 * 从子节点列表中过滤出指定类型的节点，自动处理 SyntaxList 包装器
 */
export function findNodesOfKind(
  children: string[],
  sourceFile: SourceFileAST,
  targetKind: ts.SyntaxKind
): ASTNode[] {
  const flatNodes = flattenSyntaxLists(children, sourceFile);
  return flatNodes.filter(node => node.kind === targetKind);
}

/**
 * 从子节点列表中过滤出多种类型的节点，自动处理 SyntaxList 包装器
 */
export function findNodesOfKinds(
  children: string[],
  sourceFile: SourceFileAST,
  targetKinds: ts.SyntaxKind[]
): ASTNode[] {
  const flatNodes = flattenSyntaxLists(children, sourceFile);
  return flatNodes.filter(node => targetKinds.includes(node.kind));
}

/**
 * 创建 TypeScript 节点数组，自动处理 SyntaxList 展开
 */
export function createNodeArrayFromSyntaxList(
  children: string[],
  sourceFile: SourceFileAST,
  createNode: CreateNodeFn,
  filterFn?: (node: ASTNode) => boolean
): ts.Node[] {
  const flatNodes = flattenSyntaxLists(children, sourceFile);
  const filteredNodes = filterFn ? flatNodes.filter(filterFn) : flatNodes;
  
  const tsNodes: ts.Node[] = [];
  for (const node of filteredNodes) {
    try {
      const tsNode = createNode(sourceFile, node);
      if (tsNode) {
        tsNodes.push(tsNode);
      }
    } catch (error) {
      console.warn(`Failed to create node for ${ts.SyntaxKind[node.kind]}:`, error);
    }
  }
  
  return tsNodes;
}

/**
 * 检查节点是否应该被跳过（例如分隔符、关键字等）
 */
export function shouldSkipNode(node: ASTNode): boolean {
  const skipKinds = [
    ts.SyntaxKind.CommaToken,
    ts.SyntaxKind.SemicolonToken,
    ts.SyntaxKind.OpenBraceToken,
    ts.SyntaxKind.CloseBraceToken,
    ts.SyntaxKind.OpenParenToken,
    ts.SyntaxKind.CloseParenToken,
    ts.SyntaxKind.OpenBracketToken,
    ts.SyntaxKind.CloseBracketToken,
    ts.SyntaxKind.BarToken, // | in union types
    ts.SyntaxKind.AmpersandToken, // & in intersection types
  ];
  
  return skipKinds.includes(node.kind);
}
