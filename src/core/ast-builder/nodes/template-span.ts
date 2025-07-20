import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createTemplateSpan: NodeBuilderFn<ts.TemplateSpan> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TemplateSpan => {
    const children = node.children || [];
    
    if (children.length !== 2) {
      throw new Error(`TemplateSpan should have exactly 2 children, got ${children.length}`);
    }
    
    // TemplateSpan的结构：[表达式, 字面量]
    const expressionNodeId = children[0];
    const literalTokenId = children[1];
    
    if (!expressionNodeId || !literalTokenId) {
      throw new Error('TemplateSpan missing required children');
    }
    
    // 创建表达式
    const expressionNode = sourceFile.nodes[expressionNodeId];
    if (!expressionNode) {
      throw new Error(`Expression node ${expressionNodeId} not found`);
    }
    
    const expression = createNode(sourceFile, expressionNode) as ts.Expression;
    
    // 创建字面量token
    const literalToken = sourceFile.nodes[literalTokenId];
    if (!literalToken) {
      throw new Error(`Literal token ${literalTokenId} not found`);
    }
    
    // 处理模板字面量的文本：
    // TemplateTail 包含 "}!`" - 需要去掉前缀 "}" 和后缀 "`"
    // TemplateMiddle 包含 "}...${" - 需要去掉前缀 "}" 和后缀 "${"
    let literalText = literalToken.text || '';
    
    let literal: ts.TemplateMiddle | ts.TemplateTail;
    if (literalToken.kind === ts.SyntaxKind.TemplateTail || literalToken.kind === ts.SyntaxKind.LastTemplateToken) {
      // This is a template tail (last part): "}!`" -> "!"
      if (literalText.startsWith('}')) {
        literalText = literalText.slice(1);
      }
      if (literalText.endsWith('`')) {
        literalText = literalText.slice(0, -1);
      }
      literal = ts.factory.createTemplateTail(literalText);
    } else {
      // This is a template middle (continues): "}...${" -> "..."
      if (literalText.startsWith('}')) {
        literalText = literalText.slice(1);
      }
      if (literalText.endsWith('${')) {
        literalText = literalText.slice(0, -2);
      }
      literal = ts.factory.createTemplateMiddle(literalText);
    }
    
    return ts.factory.createTemplateSpan(expression, literal);
  };
};
