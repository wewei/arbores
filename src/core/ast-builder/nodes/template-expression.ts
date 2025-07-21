import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { extractFromSyntaxList } from '../utils';

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

    // Second child contains TemplateSpan nodes (potentially wrapped in SyntaxList)
    const secondChildId = node.children[1];
    if (!secondChildId) {
      throw new Error('Template syntax list ID is missing');
    }
    
    const spanNodes = extractFromSyntaxList([secondChildId], sourceFile);

    const templateSpans: ts.TemplateSpan[] = [];
    
    for (const spanNode of spanNodes) {
      if (spanNode.kind === ts.SyntaxKind.TemplateSpan) {
        const templateSpan = createNode(sourceFile, spanNode) as ts.TemplateSpan;
        templateSpans.push(templateSpan);
      }
    }

    return ts.factory.createTemplateExpression(head, templateSpans);
  };
};
