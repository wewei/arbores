import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn } from '../types';

/**
 * 创建命名空间导入节点
 * 用于处理 import * as name from '...' 语法
 * 结构: [*, as, identifier]
 */
export function createNamespaceImport(createNode: CreateNodeFn) {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.NamespaceImport => {
    if (!node.children || node.children.length < 3) {
      throw new Error('NamespaceImport must have at least 3 children: *, as, name');
    }
    
    // 找到标识符（最后一个是命名空间名称）
    let name: ts.Identifier | undefined;
    
    for (let i = node.children.length - 1; i >= 0; i--) {
      const childId = node.children[i];
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      if (childNode.kind === ts.SyntaxKind.Identifier) {
        name = createNode(sourceFile, childNode) as ts.Identifier;
        break;
      }
    }
    
    if (!name) {
      throw new Error('NamespaceImport missing name identifier');
    }

    return ts.factory.createNamespaceImport(name);
  };
}
