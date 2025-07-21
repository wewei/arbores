import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { NodeBuilderFn, CreateNodeFn } from '../types';

export const createExportSpecifier: NodeBuilderFn<ts.ExportSpecifier> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ExportSpecifier => {
    const children = node.children || [];
    
    let propertyName: ts.Identifier | undefined;
    let name: ts.Identifier;
    let isTypeOnly = false;
    
    // 收集标识符
    const identifiers: ts.Identifier[] = [];
    
    for (const childId of children) {
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      if (childNode.kind === ts.SyntaxKind.Identifier) {
        const identifier = createNode(sourceFile, childNode) as ts.Identifier;
        identifiers.push(identifier);
      } else if (childNode.kind === ts.SyntaxKind.TypeKeyword) {
        isTypeOnly = true;
      }
    }
    
    // 根据标识符数量判断是否有重命名
    if (identifiers.length >= 2) {
      // export { original as renamed }
      propertyName = identifiers[0];
      name = identifiers[1]!;
    } else if (identifiers.length === 1) {
      // export { name }
      name = identifiers[0]!;
    } else {
      // 默认情况
      name = ts.factory.createIdentifier('unknown');
    }
    
    return ts.factory.createExportSpecifier(
      isTypeOnly,
      propertyName,
      name
    );
  };
};
