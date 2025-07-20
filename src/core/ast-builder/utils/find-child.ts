import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';

/**
 * 根据 SyntaxKind 查找子节点
 */
export function findChildByKind(
  children: string[],
  sourceFile: SourceFileAST,
  kind: ts.SyntaxKind
): ASTNode | undefined {
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (child && child.kind === kind) {
      return child;
    }
  }
  return undefined;
}

/**
 * 根据 SyntaxKind 查找所有匹配的子节点
 */
export function findChildrenByKind(
  children: string[],
  sourceFile: SourceFileAST,
  kind: ts.SyntaxKind
): ASTNode[] {
  const result: ASTNode[] = [];
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (child && child.kind === kind) {
      result.push(child);
    }
  }
  return result;
}

/**
 * 查找第一个匹配多个 SyntaxKind 的子节点
 */
export function findChildByKinds(
  children: string[],
  sourceFile: SourceFileAST,
  kinds: ts.SyntaxKind[]
): ASTNode | undefined {
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (child && kinds.includes(child.kind)) {
      return child;
    }
  }
  return undefined;
}

/**
 * 获取节点的文本内容
 */
export function getNodeText(node: ASTNode): string {
  return node.text || '';
}

/**
 * 检查节点是否为指定类型
 */
export function isNodeOfKind(node: ASTNode, kind: ts.SyntaxKind): boolean {
  return node.kind === kind;
}

/**
 * 获取节点的所有子节点
 */
export function getChildNodes(node: ASTNode, sourceFile: SourceFileAST): ASTNode[] {
  if (!node.children) {
    return [];
  }
  
  const result: ASTNode[] = [];
  for (const childId of node.children) {
    const child = sourceFile.nodes[childId];
    if (child) {
      result.push(child);
    }
  }
  return result;
}
