import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { isTypeNode } from '../utils';

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
  let typeNode: ts.TypeNode | undefined;
  let questionToken: ts.Token<ts.SyntaxKind.QuestionToken> | undefined;
  
  // 查找属性名和类型
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (!child) continue;
    
    if (child.kind === ts.SyntaxKind.Identifier && !propertyName) {
      propertyName = createNode(sourceFile, child) as ts.PropertyName;
    } else if (child.kind === ts.SyntaxKind.QuestionToken) {
      questionToken = createNode(sourceFile, child) as ts.Token<ts.SyntaxKind.QuestionToken>;
    } else if (isTypeNode(child)) {
      typeNode = createNode(sourceFile, child) as ts.TypeNode;
    }
  }
  
  if (!propertyName) {
    propertyName = ts.factory.createIdentifier('property');
  }
  
  // 创建属性签名，包含类型信息
  return ts.factory.createPropertySignature(
    undefined, // modifiers
    propertyName,
    questionToken,
    typeNode
  );
};
