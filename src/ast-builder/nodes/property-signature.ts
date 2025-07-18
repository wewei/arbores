import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建属性签名节点
 * 
 * PropertySignature 结构:
 * - 属性名
 * - 可选的问号
 * - 类型注解
 * 
 * 示例: id: number; name: string; email?: string;
 */
export const createPropertySignature: NodeBuilderFn<ts.PropertySignature> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.PropertySignature => {
  const children = node.children || [];
  let propertyName: ts.PropertyName | undefined;
  
  // 查找属性名 (通常是第一个 Identifier)
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
  
  // 简化实现：创建基本的属性签名
  return ts.factory.createPropertySignature(
    undefined, // modifiers
    propertyName,
    undefined, // question token
    undefined  // type
  );
};
