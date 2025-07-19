import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createTemplateExpression: NodeBuilderFn<ts.TemplateExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TemplateExpression => {
    if (!node.children || node.children.length !== 2) {
      throw new Error(`TemplateExpression node must have exactly 2 children: head and syntax list`);
    }

    // First child is the template head (TemplateHead token)
    const headId = node.children[0];
    if (!headId) {
      throw new Error('Template head ID is missing');
    }
    
    const headNode = sourceFile.nodes[headId];
    if (!headNode) {
      throw new Error(`Template head node ${headId} not found`);
    }

    // 处理TemplateHead的文本："`Hello, ${" -> "Hello, "
    let headText = headNode.text || '';
    if (headText.startsWith('`')) {
      headText = headText.slice(1);
    }
    if (headText.endsWith('${')) {
      headText = headText.slice(0, -2);
    }

    const head = ts.factory.createTemplateHead(headText);

    // Second child is SyntaxList containing TemplateSpan nodes
    const syntaxListId = node.children[1];
    if (!syntaxListId) {
      throw new Error('Template syntax list ID is missing');
    }
    
    const syntaxListNode = sourceFile.nodes[syntaxListId];
    if (!syntaxListNode || !syntaxListNode.children) {
      throw new Error('Template syntax list node not found or has no children');
    }

    const templateSpans: ts.TemplateSpan[] = [];
    
    for (const spanId of syntaxListNode.children) {
      if (!spanId) continue;
      
      const spanNode = sourceFile.nodes[spanId];
      if (!spanNode) continue;
      
      // Use the generic createNode to handle TemplateSpan
      const templateSpan = createNode(sourceFile, spanNode) as ts.TemplateSpan;
      templateSpans.push(templateSpan);
    }

    return ts.factory.createTemplateExpression(head, templateSpans);
  };
};
