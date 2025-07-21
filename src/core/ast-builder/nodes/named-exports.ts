import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { NodeBuilderFn, CreateNodeFn } from '../types';

export const createNamedExports: NodeBuilderFn<ts.NamedExports> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.NamedExports => {
    const children = node.children || [];
    const elements: ts.ExportSpecifier[] = [];
    
    // 遍历子节点，找到所有的 ExportSpecifier
    for (const childId of children) {
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      if (childNode.kind === ts.SyntaxKind.ExportSpecifier) {
        const exportSpecifier = createNode(sourceFile, childNode) as ts.ExportSpecifier;
        elements.push(exportSpecifier);
      } else if (childNode.kind === ts.SyntaxKind.SyntaxList) {
        // 处理 SyntaxList 节点，它可能包含多个 ExportSpecifier
        const syntaxListChildren = childNode.children || [];
        for (const specifierId of syntaxListChildren) {
          const specifierNode = sourceFile.nodes[specifierId];
          if (!specifierNode) continue;
          
          if (specifierNode.kind === ts.SyntaxKind.ExportSpecifier) {
            const exportSpecifier = createNode(sourceFile, specifierNode) as ts.ExportSpecifier;
            elements.push(exportSpecifier);
          }
        }
      }
    }
    
    return ts.factory.createNamedExports(elements);
  };
};
