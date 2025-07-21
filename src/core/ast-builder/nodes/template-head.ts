import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createTemplateHead: NodeBuilderFn<ts.TemplateHead> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TemplateHead => {
    let text = node.text || '';
    
    // TemplateHead 包含完整的分隔符，例如 "`on${" 
    // 我们需要去掉开头的 ` 和结尾的 ${
    if (text.startsWith('`')) {
      text = text.slice(1);
    }
    if (text.endsWith('${')) {
      text = text.slice(0, -2);
    }
    
    return ts.factory.createTemplateHead(text);
  };
};
