import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建修饰符节点
 */
export const createModifier: NodeBuilderFn<ts.Modifier> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.Modifier => {
    return ts.factory.createModifier(node.kind as ts.ModifierSyntaxKind);
  };
};
