import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn } from '../types';

/**
 * 创建具名导入节点
 * 用于处理 import { foo, bar } from '...' 中的 { foo, bar } 部分
 */
export function createNamedImports(createNode: CreateNodeFn) {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.NamedImports => {
    const elements: ts.ImportSpecifier[] = [];
    
    if (node.children) {
      for (const childId of node.children) {
        const childNode = sourceFile.nodes[childId];
        if (!childNode) continue;
        
        // 跳过括号等 token
        if (childNode.kind === ts.SyntaxKind.OpenBraceToken ||
            childNode.kind === ts.SyntaxKind.CloseBraceToken) {
          continue;
        }
        
        // 处理 SyntaxList（包含所有 ImportSpecifier）
        if (childNode.kind === ts.SyntaxKind.SyntaxList) {
          if (childNode.children) {
            for (const elementId of childNode.children) {
              const elementNode = sourceFile.nodes[elementId];
              if (!elementNode) continue;
              
              // 跳过逗号
              if (elementNode.kind === ts.SyntaxKind.CommaToken) {
                continue;
              }
              
              // 处理 ImportSpecifier
              if (elementNode.kind === ts.SyntaxKind.ImportSpecifier) {
                elements.push(createNode(sourceFile, elementNode) as ts.ImportSpecifier);
              }
            }
          }
        }
        // 直接的 ImportSpecifier 或 Identifier
        else if (childNode.kind === ts.SyntaxKind.ImportSpecifier) {
          elements.push(createNode(sourceFile, childNode) as ts.ImportSpecifier);
        }
        else if (childNode.kind === ts.SyntaxKind.Identifier) {
          const name = createNode(sourceFile, childNode) as ts.Identifier;
          elements.push(ts.factory.createImportSpecifier(false, undefined, name));
        }
      }
    }
    
    return ts.factory.createNamedImports(elements);
  };
}
