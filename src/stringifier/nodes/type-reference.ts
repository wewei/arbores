import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { findChildByKind } from '../utils';

// 创建类型引用节点
export function createTypeReferenceNode(node: ASTNode, ast: SourceFileAST): ts.TypeReferenceNode {
  const children = node.children || [];
  const typeNameNode = findChildByKind(children, ast, ts.SyntaxKind.Identifier);
  
  // 查找泛型参数 - 在 < 和 > 之间的 SyntaxList
  const typeArguments: ts.TypeNode[] = [];
  const lessThanIndex = children.findIndex(childId => {
    const childNode = ast.nodes[childId];
    return childNode && (childNode.kind === ts.SyntaxKind.LessThanToken || childNode.kind === ts.SyntaxKind.FirstBinaryOperator);
  });
  const greaterThanIndex = children.findIndex(childId => {
    const childNode = ast.nodes[childId];
    return childNode && childNode.kind === ts.SyntaxKind.GreaterThanToken;
  });
  
  if (lessThanIndex !== -1 && greaterThanIndex !== -1) {
    for (let i = lessThanIndex + 1; i < greaterThanIndex; i++) {
      const childId = children[i];
      if (childId) {
        const childNode = ast.nodes[childId];
        if (childNode && childNode.kind === ts.SyntaxKind.SyntaxList && childNode.children) {
          for (const typeArgId of childNode.children) {
            const typeArgNode = ast.nodes[typeArgId];
            if (typeArgNode) {
              switch (typeArgNode.kind) {
                case ts.SyntaxKind.AnyKeyword:
                  typeArguments.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
                  break;
                case ts.SyntaxKind.StringKeyword:
                  typeArguments.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword));
                  break;
                case ts.SyntaxKind.NumberKeyword:
                  typeArguments.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword));
                  break;
                case ts.SyntaxKind.BooleanKeyword:
                  typeArguments.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword));
                  break;
                case ts.SyntaxKind.VoidKeyword:
                  typeArguments.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword));
                  break;
                case ts.SyntaxKind.TypeReference:
                  typeArguments.push(createTypeReferenceNode(typeArgNode, ast));
                  break;
                case ts.SyntaxKind.Identifier:
                  typeArguments.push(ts.factory.createTypeReferenceNode(typeArgNode.text || 'any', undefined));
                  break;
              }
            }
          }
        }
      }
    }
  }
  
  return ts.factory.createTypeReferenceNode(
    typeNameNode ? ts.factory.createIdentifier(typeNameNode.text || '') :
                  ts.factory.createIdentifier('any'),
    typeArguments.length > 0 ? typeArguments : undefined
  );
} 