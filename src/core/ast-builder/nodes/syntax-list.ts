import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, CreateSyntaxListFn } from '../types';
import { createNodeArrayFromSyntaxList } from '../utils/syntax-list';

/**
 * 创建语法列表节点
 * 
 * SyntaxList 是 TypeScript AST 中的包装器节点，通常包含其他节点的列表。
 * 这个函数会直接创建一个 NodeArray，包含所有有效的子节点。
 */
export const createSyntaxList: CreateSyntaxListFn = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.NodeArray<ts.Node> => {
    const tsNodes = createNodeArrayFromSyntaxList(
      node.children || [], 
      sourceFile, 
      createNode
    );
    
    return ts.factory.createNodeArray(tsNodes);
  };
};
