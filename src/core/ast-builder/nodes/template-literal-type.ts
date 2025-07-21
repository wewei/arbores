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
        // TemplateSpan 包含 [expression, literal]
        const templateSpanChildren = childNode.children || [];
        if (templateSpanChildren.length >= 2) {
          const expressionId = templateSpanChildren[0];
          const literalId = templateSpanChildren[1];
          
          if (expressionId && literalId) {
            const expressionNode = sourceFile.nodes[expressionId];
            const literalNode = sourceFile.nodes[literalId];
            
            if (expressionNode && literalNode) {
              const expression = createNode(sourceFile, expressionNode) as ts.TypeNode;
              
              // 处理模板字面量的文本：需要去掉分隔符
              let literalText = literalNode.text || '';
              let literal: ts.TemplateMiddle | ts.TemplateTail;
              
              if (literalNode.kind === ts.SyntaxKind.TemplateTail || literalNode.kind === ts.SyntaxKind.LastTemplateToken) {
                // TemplateTail: "}`" -> ""（空字符串）
                if (literalText.startsWith('}')) {
                  literalText = literalText.slice(1);
                }
                if (literalText.endsWith('`')) {
                  literalText = literalText.slice(0, -1);
                }
                literal = ts.factory.createTemplateTail(literalText);
              } else {
                // TemplateMiddle: "}...${" -> "..."
                if (literalText.startsWith('}')) {
                  literalText = literalText.slice(1);
                }
                if (literalText.endsWith('${')) {
                  literalText = literalText.slice(0, -2);
                }
                literal = ts.factory.createTemplateMiddle(literalText);
              }
              
              const span = ts.factory.createTemplateLiteralTypeSpan(expression, literal);
              templateSpans.push(span);
            }
          }
        }
      } else if (childNode.kind === ts.SyntaxKind.SyntaxList && childNode.children) {
        // 处理 SyntaxList 中的 TemplateLiteralTypeSpan
        for (const syntaxListChildId of childNode.children) {
          const syntaxListChild = sourceFile.nodes[syntaxListChildId!];
          if (syntaxListChild?.kind === ts.SyntaxKind.TemplateLiteralTypeSpan) {
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
