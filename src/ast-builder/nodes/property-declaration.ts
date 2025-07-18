import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建属性声明节点
 * 
 * PropertyDeclaration 结构:
 * - 修饰符 (private, public, etc.)
 * - 属性名
 * - 类型注解
 * - 初始化器
 * 
 * 示例: private value: number = 0;
 */
export const createPropertyDeclaration: NodeBuilderFn<ts.PropertyDeclaration> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.PropertyDeclaration => {
  const children = node.children || [];
  let propertyName: ts.PropertyName | undefined;
  
  // 查找属性名 (通常是 Identifier)
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (child && child.kind === ts.SyntaxKind.Identifier) {
      propertyName = createNode(sourceFile, child) as ts.PropertyName;
      break;
    }
  }
  
  if (!propertyName) {
    propertyName = ts.factory.createIdentifier('property');
  }
  
  // 简化实现：创建基本的属性声明
  return ts.factory.createPropertyDeclaration(
    undefined, // modifiers
    propertyName,
    undefined, // question token
    undefined, // type
    undefined  // initializer
  );
};
