import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { NodeBuilderFn, CreateNodeFn } from '../types';

export const createExportDeclaration: NodeBuilderFn<ts.ExportDeclaration> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ExportDeclaration => {
    const children = node.children || [];
    
    // 获取子节点
    let exportClause: ts.NamedExports | ts.NamespaceExport | undefined;
    let moduleSpecifier: ts.Expression | undefined;
    let isTypeOnly = false;
    let attributes: ts.ImportAttributes | undefined;
    
    // 遍历子节点找到相关部分
    for (const childId of children) {
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      switch (childNode.kind) {
        case ts.SyntaxKind.NamedExports:
          exportClause = createNode(sourceFile, childNode) as ts.NamedExports;
          break;
        case ts.SyntaxKind.NamespaceExport:
          exportClause = createNode(sourceFile, childNode) as ts.NamespaceExport;
          break;
        case ts.SyntaxKind.StringLiteral:
          moduleSpecifier = createNode(sourceFile, childNode) as ts.StringLiteral;
          break;
        case ts.SyntaxKind.TypeKeyword:
          isTypeOnly = true;
          break;
      }
    }
    
    return ts.factory.createExportDeclaration(
      undefined, // modifiers
      isTypeOnly,
      exportClause,
      moduleSpecifier,
      attributes
    );
  };
};
