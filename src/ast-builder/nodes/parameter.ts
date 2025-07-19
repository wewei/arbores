import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建参数声明节点
 * 
 * Parameter 结构:
 * - 参数名 (Identifier)
 * - 可选的类型注解
 * - 可选的默认值
 * 
 * 示例: x, data: string, count = 0
 */
export const createParameter: NodeBuilderFn<ts.ParameterDeclaration> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.ParameterDeclaration => {
  const children = node.children || [];
  
  if (children.length < 1) {
    throw new Error(`Parameter requires at least 1 child (name), got ${children.length}`);
  }

  // children[0] 通常是参数名
  const nameNode = sourceFile.nodes[children[0]!];
  if (!nameNode) {
    throw new Error(`Cannot find parameter name node with id: ${children[0]}`);
  }
  
  const name = createNode(sourceFile, nameNode) as ts.BindingName;
  
  // 处理类型注解和默认值
  let type: ts.TypeNode | undefined;
  let initializer: ts.Expression | undefined;
  
  // 遍历其余子节点查找类型和初始值
  for (let i = 1; i < children.length; i++) {
    const childId = children[i];
    if (!childId) continue;
    
    const childNode = sourceFile.nodes[childId];
    if (childNode) {
      if (childNode.kind === ts.SyntaxKind.ColonToken) {
        // 下一个节点应该是类型
        if (i + 1 < children.length) {
          const nextChildId = children[i + 1];
          if (nextChildId) {
            const typeNode = sourceFile.nodes[nextChildId];
            if (typeNode && (
              typeNode.kind === ts.SyntaxKind.StringKeyword ||
              typeNode.kind === ts.SyntaxKind.NumberKeyword ||
              typeNode.kind === ts.SyntaxKind.BooleanKeyword ||
              typeNode.kind === ts.SyntaxKind.TypeReference
            )) {
              type = createNode(sourceFile, typeNode) as ts.TypeNode;
              i++; // 跳过已处理的类型节点
            }
          }
        }
      } else if (childNode.kind === ts.SyntaxKind.FirstAssignment) {
        // 下一个节点应该是初始值
        if (i + 1 < children.length) {
          const nextChildId = children[i + 1];
          if (nextChildId) {
            const initNode = sourceFile.nodes[nextChildId];
            if (initNode) {
              initializer = createNode(sourceFile, initNode) as ts.Expression;
              i++; // 跳过已处理的初始值节点
            }
          }
        }
      }
    }
  }
  
  return ts.factory.createParameterDeclaration(
    undefined, // modifiers
    undefined, // dotDotDotToken
    name,
    undefined, // questionToken
    type,      // type
    initializer // initializer
  );
};
