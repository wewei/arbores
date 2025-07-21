import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createTemplateLiteralType: NodeBuilderFn<ts.TemplateLiteralTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TemplateLiteralTypeNode => {
    const children = node.children || [];
    
    if (children.length < 1) {
      throw new Error(`TemplateLiteralType should have at least 1 child, got ${children.length}`);
    }
    
    // TemplateLiteralType 的结构：类似于 TemplateExpression，有头部和spans
    let headId: string | undefined;
    let templateSpanIds: string[] = [];
    
    // 第一个通常是 head (TemplateHead 或 NoSubstitutionTemplateLiteral)
    headId = children[0];
    
    // 其余的是 TemplateSpan
    for (let i = 1; i < children.length; i++) {
      const childId = children[i];
      if (childId) {
        const childNode = sourceFile.nodes[childId];
        if (childNode && childNode.kind === ts.SyntaxKind.TemplateSpan) {
          templateSpanIds.push(childId);
        }
      }
    }
    
    if (!headId) {
      throw new Error('TemplateLiteralType missing head');
    }
    
    // 创建头部
    const headNode = sourceFile.nodes[headId];
    if (!headNode) {
      throw new Error(`Head node ${headId} not found`);
    }
    
    const head = createNode(sourceFile, headNode) as ts.TemplateHead | ts.NoSubstitutionTemplateLiteral;
    
    // 创建 template spans
    const templateSpans = templateSpanIds
      .map(spanId => {
        const spanNode = sourceFile.nodes[spanId];
        if (spanNode) {
          return createNode(sourceFile, spanNode) as ts.TemplateLiteralTypeSpan;
        }
        return null;
      })
      .filter((span): span is ts.TemplateLiteralTypeSpan => span !== null);
    
    // 如果没有 spans，说明是简单的模板字面量
    if (templateSpans.length === 0) {
      // 对于简单情况，创建一个基本的模板字面量类型
      return ts.factory.createTemplateLiteralType(
        head as ts.TemplateHead,
        []
      );
    }
    
    return ts.factory.createTemplateLiteralType(
      head as ts.TemplateHead,
      templateSpans
    );
  };
};
