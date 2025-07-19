import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createImportDeclaration: NodeBuilderFn<ts.ImportDeclaration> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ImportDeclaration => {
    const children = node.children || [];
    
    if (children.length < 3) {
      throw new Error(`ImportDeclaration should have at least 3 children (import, clause, from), got ${children.length}`);
    }
    
    // ImportDeclaration的结构：[import关键字, importClause?, from, moduleSpecifier, ;?]
    let importKeywordId = children[0];
    let importClauseId: string | undefined;
    let fromKeywordId: string | undefined;
    let moduleSpecifierId: string | undefined;
    
    // 找到各个组件的位置
    for (let i = 0; i < children.length; i++) {
      const childId = children[i];
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      if (childNode.kind === ts.SyntaxKind.ImportKeyword) {
        importKeywordId = childId;
      } else if (childNode.kind === ts.SyntaxKind.FromKeyword) {
        fromKeywordId = childId;
      } else if (childNode.kind === ts.SyntaxKind.StringLiteral) {
        moduleSpecifierId = childId;
      } else if (childNode.kind === ts.SyntaxKind.ImportClause) {
        importClauseId = childId;
      }
    }
    
    if (!moduleSpecifierId) {
      throw new Error('ImportDeclaration missing module specifier');
    }
    
    // 创建模块说明符
    const moduleSpecifierNode = sourceFile.nodes[moduleSpecifierId];
    if (!moduleSpecifierNode) {
      throw new Error(`Module specifier node ${moduleSpecifierId} not found`);
    }
    const moduleSpecifier = createNode(sourceFile, moduleSpecifierNode) as ts.Expression;
    
    // 创建import clause（如果存在）
    let importClause: ts.ImportClause | undefined;
    if (importClauseId) {
      const importClauseNode = sourceFile.nodes[importClauseId];
      if (importClauseNode) {
        importClause = createNode(sourceFile, importClauseNode) as ts.ImportClause;
      }
    }
    
    return ts.factory.createImportDeclaration(
      undefined, // modifiers
      importClause,
      moduleSpecifier,
      undefined // attributes
    );
  };
};
