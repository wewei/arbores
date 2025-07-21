import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createTemplateHead: NodeBuilderFn<ts.TemplateHead> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TemplateHead => {
    const text = node.text || '';
    
    // TemplateHead 是模板字符串的开头部分，如 `hello ${
    // 我们需要创建一个 TemplateHead token
    return ts.factory.createTemplateHead(text);
  };
};
