import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createTemplateLiteralType: NodeBuilderFn<ts.TemplateLiteralTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TemplateLiteralTypeNode => {
    const children = node.children || [];
    
    if (children.length < 1) {
      throw new Error(`TemplateLiteralType should have at least 1 child, got ${children.length}`);
    }
    
    // TemplateLiteralType 的结构：[TemplateHead, SyntaxList with TemplateSpan...]
    let head: ts.TemplateHead | ts.NoSubstitutionTemplateLiteral | undefined;
    let templateSpans: ts.TemplateLiteralTypeSpan[] = [];
    
    for (const childId of children) {
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      if (childNode.kind === ts.SyntaxKind.TemplateHead || 
          childNode.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
        head = createNode(sourceFile, childNode) as ts.TemplateHead | ts.NoSubstitutionTemplateLiteral;
      } else if (childNode.kind === ts.SyntaxKind.TemplateSpan) {
        const span = createNode(sourceFile, childNode) as ts.TemplateLiteralTypeSpan;
        templateSpans.push(span);
      } else if (childNode.kind === ts.SyntaxKind.SyntaxList && childNode.children) {
        // 处理 SyntaxList 中的 TemplateSpan
        for (const syntaxListChildId of childNode.children) {
          const syntaxListChild = sourceFile.nodes[syntaxListChildId!];
          if (syntaxListChild?.kind === ts.SyntaxKind.TemplateSpan) {
            const span = createNode(sourceFile, syntaxListChild) as ts.TemplateLiteralTypeSpan;
            templateSpans.push(span);
          }
        }
      }
    }
    
    if (!head) {
      throw new Error('TemplateLiteralType missing head');
    }
    
    // 对于 NoSubstitutionTemplateLiteral，直接返回类型
    if (head.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
      return ts.factory.createTemplateLiteralType(
        ts.factory.createTemplateHead((head as any).text || ''),
        []
      );
    }
    
    return ts.factory.createTemplateLiteralType(
      head as ts.TemplateHead,
      templateSpans
    );
  };
};
