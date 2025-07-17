import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../types';

// 辅助函数：获取修饰符
export function getModifiers(children: string[], ast: SourceFileAST): ts.NodeArray<ts.Modifier> | undefined {
  const modifiers = children
    .map(childId => ast.nodes[childId])
    .filter((childNode): childNode is ASTNode => {
      if (!childNode) return false;
      return (
        childNode.kind === ts.SyntaxKind.AsyncKeyword ||
        childNode.kind === ts.SyntaxKind.PrivateKeyword ||
        childNode.kind === ts.SyntaxKind.PublicKeyword ||
        childNode.kind === ts.SyntaxKind.ProtectedKeyword ||
        childNode.kind === ts.SyntaxKind.StaticKeyword ||
        childNode.kind === ts.SyntaxKind.ReadonlyKeyword
      );
    })
    .map(childNode => createModifierNode(childNode));
  
  return modifiers.length > 0 ? ts.factory.createNodeArray(modifiers) : undefined;
}

// 辅助函数：根据类型查找子节点
export function findChildByKind(children: string[], ast: SourceFileAST, kind: ts.SyntaxKind): ASTNode | undefined {
  return children
    .map(childId => ast.nodes[childId])
    .find(childNode => childNode && childNode.kind === kind);
}

// 辅助函数：创建修饰符节点
export function createModifierNode(node: ASTNode): ts.Modifier {
  switch (node.text) {
    case 'async':
      return ts.factory.createToken(ts.SyntaxKind.AsyncKeyword);
    case 'private':
      return ts.factory.createToken(ts.SyntaxKind.PrivateKeyword);
    case 'public':
      return ts.factory.createToken(ts.SyntaxKind.PublicKeyword);
    case 'protected':
      return ts.factory.createToken(ts.SyntaxKind.ProtectedKeyword);
    case 'static':
      return ts.factory.createToken(ts.SyntaxKind.StaticKeyword);
    case 'readonly':
      return ts.factory.createToken(ts.SyntaxKind.ReadonlyKeyword);
    default:
      return ts.factory.createToken(ts.SyntaxKind.AsyncKeyword);
  }
}

// 辅助函数：递归创建 TypeScript 节点
export function createTSNodeRecursive(node: ASTNode, ast: SourceFileAST): ts.Node {
  // 对于简单节点直接创建
  switch (node.kind) {
    case ts.SyntaxKind.Identifier:
      return ts.factory.createIdentifier(node.text || '');
    case ts.SyntaxKind.StringLiteral:
      return ts.factory.createStringLiteral(node.text || '');
    case ts.SyntaxKind.NumericLiteral:
      return ts.factory.createNumericLiteral(node.text || '0');
    case ts.SyntaxKind.TrueKeyword:
      return ts.factory.createTrue();
    case ts.SyntaxKind.FalseKeyword:
      return ts.factory.createFalse();
    default:
      // 对于复杂节点，返回占位符
      return ts.factory.createIdentifier(`/* ${ts.SyntaxKind[node.kind]} node */`);
  }
} 