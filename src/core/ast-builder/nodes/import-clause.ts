import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn } from '../types';

/**
 * 创建导入子句节点
 * 用于处理 import 语句中的导入部分，如：
 * import defaultExport from '...'
 * import { namedExport } from '...'
 * import * as namespace from '...'
 */
export function createImportClause(createNode: CreateNodeFn) {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ImportClause => {
    // ImportClause 的结构可能是：
    // 1. [name] - default import: import foo from '...'
    // 2. [namedBindings] - named import: import { foo } from '...'
    // 3. [name, namedBindings] - 混合: import foo, { bar } from '...'
    
    let name: ts.Identifier | undefined;
    let namedBindings: ts.NamedImportBindings | undefined;
    
    if (node.children) {
      for (const childId of node.children) {
        const childNode = sourceFile.nodes[childId];
        if (!childNode) continue;
        
        // 根据子节点类型确定它是 name 还是 namedBindings
        if (childNode.kind === ts.SyntaxKind.Identifier) {
          name = createNode(sourceFile, childNode) as ts.Identifier;
        } else {
          // 其他情况作为 namedBindings 处理
          namedBindings = createNode(sourceFile, childNode) as ts.NamedImportBindings;
        }
      }
    }
    
    return ts.factory.createImportClause(false, name, namedBindings);
  };
}
