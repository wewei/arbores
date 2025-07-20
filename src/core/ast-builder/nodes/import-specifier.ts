import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn } from '../types';

/**
 * 创建导入说明符节点
 * 用于处理具名导入中的单个项目：
 * - import { foo } from '...' 中的 foo
 * - import { foo as bar } from '...' 中的 foo as bar
 */
export function createImportSpecifier(createNode: CreateNodeFn) {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ImportSpecifier => {
    // ImportSpecifier 的结构可能是：
    // 1. [name] - 简单导入: import { foo }
    // 2. [propertyName, as, name] - 重命名导入: import { foo as bar }
    
    let propertyName: ts.Identifier | undefined;
    let name: ts.Identifier | undefined;
    
    if (!node.children || node.children.length === 0) {
      throw new Error('ImportSpecifier must have at least one child');
    }
    
    if (node.children.length === 1) {
      // 简单导入
      const nameId = node.children[0];
      if (!nameId) {
        throw new Error('Missing name ID');
      }
      const nameNode = sourceFile.nodes[nameId];
      if (!nameNode) {
        throw new Error(`Name node ${nameId} not found`);
      }
      name = createNode(sourceFile, nameNode) as ts.Identifier;
    } else {
      // 重命名导入 - 查找 propertyName 和 name
      for (let i = 0; i < node.children.length; i++) {
        const childId = node.children[i];
        if (!childId) continue;
        
        const childNode = sourceFile.nodes[childId];
        if (!childNode) continue;
        
        if (childNode.kind === ts.SyntaxKind.Identifier) {
          if (!propertyName) {
            propertyName = createNode(sourceFile, childNode) as ts.Identifier;
          } else if (!name) {
            name = createNode(sourceFile, childNode) as ts.Identifier;
          }
        }
        // 跳过 'as' 关键字
      }
      
      if (!name) {
        throw new Error('ImportSpecifier missing name');
      }
    }
    
    if (!name) {
      throw new Error('ImportSpecifier missing name');
    }

    return ts.factory.createImportSpecifier(false, propertyName, name);
  };
}
