import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建属性赋值节点
 * 
 * PropertyAssignment 结构:
 * - children[0]: 属性名 (Identifier)
 * - children[1]: 冒号 (:)
 * - children[2]: 属性值表达式
 * 
 * 示例: x: 10, name: "hello"
 */
export const createPropertyAssignment: NodeBuilderFn<ts.PropertyAssignment> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.PropertyAssignment => {
  const children = node.children || [];
  
  if (children.length < 3) {
    throw new Error(`PropertyAssignment requires at least 3 children (name + colon + value), got ${children.length}`);
  }

  // children[0] 是属性名
  const propertyNameNode = sourceFile.nodes[children[0]!];
  if (!propertyNameNode) {
    throw new Error(`Cannot find property name node with id: ${children[0]}`);
  }
  
  // children[2] 是属性值 (跳过children[1]的冒号)
  const propertyValueNode = sourceFile.nodes[children[2]!];
  if (!propertyValueNode) {
    throw new Error(`Cannot find property value node with id: ${children[2]}`);
  }

  const propertyName = createNode(sourceFile, propertyNameNode) as ts.PropertyName;
  const propertyValue = createNode(sourceFile, propertyValueNode) as ts.Expression;

  return ts.factory.createPropertyAssignment(propertyName, propertyValue);
};
