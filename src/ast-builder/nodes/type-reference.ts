import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建类型引用节点
 * 
 * TypeReference 结构:
 * - 类型名称 (Identifier)
 * - 可选的类型参数
 * 
 * 示例: User, Array<string>, Promise<User>
 */
export const createTypeReference: NodeBuilderFn<ts.TypeReferenceNode> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.TypeReferenceNode => {
  const children = node.children || [];
  
  if (children.length < 1) {
    throw new Error(`TypeReference requires at least 1 child (type name), got ${children.length}`);
  }

  // children[0] 是类型名称
  const typeNameNode = sourceFile.nodes[children[0]!];
  if (!typeNameNode) {
    throw new Error(`Cannot find type name node with id: ${children[0]}`);
  }
  
  const typeName = createNode(sourceFile, typeNameNode) as ts.EntityName;
  
  // TODO: 处理类型参数 (泛型)
  // 目前只处理简单的类型引用
  
  return ts.factory.createTypeReferenceNode(typeName, undefined);
};
