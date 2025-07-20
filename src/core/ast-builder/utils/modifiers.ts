import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn } from '../types';
import { findChildrenByKind, isNodeOfKind } from './find-child';

/**
 * 提取节点的修饰符
 */
export function getModifiers(
  children: string[],
  sourceFile: SourceFileAST,
  createNode: CreateNodeFn
): ts.Modifier[] {
  const modifiers: ts.Modifier[] = [];
  
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (!child) continue;
    
    // 检查是否为修饰符
    if (isModifierKind(child.kind)) {
      const modifier = createNode(sourceFile, child) as ts.Modifier;
      modifiers.push(modifier);
    }
  }
  
  return modifiers;
}

/**
 * 检查 SyntaxKind 是否为修饰符
 */
export function isModifierKind(kind: ts.SyntaxKind): boolean {
  return [
    ts.SyntaxKind.AbstractKeyword,
    ts.SyntaxKind.AsyncKeyword,
    ts.SyntaxKind.ConstKeyword,
    ts.SyntaxKind.DeclareKeyword,
    ts.SyntaxKind.DefaultKeyword,
    ts.SyntaxKind.ExportKeyword,
    ts.SyntaxKind.PrivateKeyword,
    ts.SyntaxKind.ProtectedKeyword,
    ts.SyntaxKind.PublicKeyword,
    ts.SyntaxKind.ReadonlyKeyword,
    ts.SyntaxKind.StaticKeyword,
    ts.SyntaxKind.OverrideKeyword,
  ].includes(kind);
}

/**
 * 创建修饰符节点
 */
export function createModifier(kind: ts.SyntaxKind): ts.Modifier {
  return ts.factory.createModifier(kind as ts.ModifierSyntaxKind);
}

/**
 * 获取异步修饰符
 */
export function hasAsyncModifier(
  children: string[],
  sourceFile: SourceFileAST
): boolean {
  return children.some(childId => {
    const child = sourceFile.nodes[childId];
    return child && child.kind === ts.SyntaxKind.AsyncKeyword;
  });
}

/**
 * 获取访问修饰符
 */
export function getAccessModifier(
  children: string[],
  sourceFile: SourceFileAST
): ts.SyntaxKind | undefined {
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (!child) continue;
    
    if (child.kind === ts.SyntaxKind.PrivateKeyword ||
        child.kind === ts.SyntaxKind.ProtectedKeyword ||
        child.kind === ts.SyntaxKind.PublicKeyword) {
      return child.kind;
    }
  }
  return undefined;
}
