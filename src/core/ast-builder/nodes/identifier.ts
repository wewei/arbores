import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { getNodeText } from '../utils/find-child';

/**
 * 创建标识符节点
 */
export const createIdentifier: NodeBuilderFn<ts.Identifier> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.Identifier => {
    const text = getNodeText(node);
    return ts.factory.createIdentifier(text || 'identifier');
  };
};
