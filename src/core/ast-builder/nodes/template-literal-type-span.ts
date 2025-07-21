import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createTemplateLiteralTypeSpan: NodeBuilderFn<ts.TemplateLiteralTypeSpan> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TemplateLiteralTypeSpan => {
    const children = node.children || [];
    
    if (children.length !== 2) {
      throw new Error(`TemplateLiteralTypeSpan should have exactly 2 children, got ${children.length}`);
    }
    
    // TemplateLiteralTypeSpan 的结构：[type, literal]
    const typeNodeId = children[0];
    const literalTokenId = children[1];
    
    if (!typeNodeId || !literalTokenId) {
      throw new Error('TemplateLiteralTypeSpan missing required children');
    }
    
    // 创建类型节点
    const typeNode = sourceFile.nodes[typeNodeId];
    if (!typeNode) {
      throw new Error(`Type node ${typeNodeId} not found`);
    }
    
    const type = createNode(sourceFile, typeNode) as ts.TypeNode;
    
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
    
    return ts.factory.createTemplateLiteralTypeSpan(type, literal);
  };
};
