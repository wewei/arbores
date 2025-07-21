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
  
  // 处理类型参数 (泛型)
  let typeArguments: ts.TypeNode[] | undefined = undefined;
  
  if (children.length > 1) {
    // 查找可能的泛型参数
    for (let i = 1; i < children.length; i++) {
      const childId = children[i];
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      // 跳过 < 和 > token
      if (childNode.kind === ts.SyntaxKind.LessThanToken || 
          childNode.kind === ts.SyntaxKind.GreaterThanToken) {
        continue;
      }
      
      // 处理 SyntaxList 包含的类型参数
      if (childNode.kind === ts.SyntaxKind.SyntaxList && childNode.children) {
        typeArguments = [];
        for (const typeArgId of childNode.children) {
          if (typeArgId) {
            const typeArgNode = sourceFile.nodes[typeArgId];
            if (typeArgNode) {
              // 跳过逗号分隔符
              if (typeArgNode.kind === ts.SyntaxKind.CommaToken) {
                continue;
              }
              const typeArg = createNode(sourceFile, typeArgNode) as ts.TypeNode;
              typeArguments.push(typeArg);
            }
          }
        }
      } else {
        // 直接的类型参数
        if (!typeArguments) typeArguments = [];
        const typeArg = createNode(sourceFile, childNode) as ts.TypeNode;
        typeArguments.push(typeArg);
      }
    }
  }
  
  return ts.factory.createTypeReferenceNode(typeName, typeArguments);
};
