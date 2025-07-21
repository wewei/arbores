import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建简写属性赋值节点
 * 
 * ShorthandPropertyAssignment 结构:
 * - children[0]: 属性名 (Identifier)
 * 
 * 示例: { name, age } 中的 name 和 age
 */
export const createShorthandPropertyAssignment: NodeBuilderFn<ts.ShorthandPropertyAssignment> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.ShorthandPropertyAssignment => {
  const children = node.children || [];
  
  if (children.length < 1) {
    throw new Error(`ShorthandPropertyAssignment requires at least 1 child (name), got ${children.length}`);
  }

  // children[0] 是属性名
  const propertyNameNode = sourceFile.nodes[children[0]!];
  if (!propertyNameNode) {
    throw new Error(`Cannot find property name node with id: ${children[0]}`);
  }

  const propertyName = createNode(sourceFile, propertyNameNode) as ts.Identifier;

  return ts.factory.createShorthandPropertyAssignment(propertyName);
}; 