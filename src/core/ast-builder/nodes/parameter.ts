import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { isTypeNode } from '../utils';

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
    throw new Error(`Parameter requires at least 1 child, got ${children.length}`);
  }

  let modifiers: ts.Modifier[] = [];
  let nameNode: ASTNode | undefined;
  let nameIndex = 0;

  // 检查第一个子节点是否是修饰符列表 (SyntaxList)
  const firstChildId = children[0]!;
  const firstChild = sourceFile.nodes[firstChildId];
  
  if (firstChild && firstChild.kind === ts.SyntaxKind.SyntaxList && firstChild.children) {
    // 处理修饰符
    for (const modifierId of firstChild.children) {
      const modifierNode = sourceFile.nodes[modifierId];
      if (modifierNode) {
        const modifier = createNode(sourceFile, modifierNode) as ts.Modifier;
        modifiers.push(modifier);
      }
    }
    nameIndex = 1; // 名称在第二个位置
  }
  
  // 获取参数名
  if (nameIndex >= children.length) {
    throw new Error(`Cannot find parameter name node after modifiers`);
  }
  
  const nameNodeId = children[nameIndex]!;
  nameNode = sourceFile.nodes[nameNodeId];
  if (!nameNode) {
    throw new Error(`Cannot find parameter name node with id: ${nameNodeId}`);
  }
  
  const name = createNode(sourceFile, nameNode) as ts.BindingName;
  
  // 处理类型注解、默认值和 rest 参数
  let dotDotDotToken: ts.DotDotDotToken | undefined;
  let type: ts.TypeNode | undefined;
  let initializer: ts.Expression | undefined;
  
  // 遍历剩余子节点查找类型和初始值
  for (let i = nameIndex + 1; i < children.length; i++) {
    const childId = children[i];
    if (!childId) continue;
    
    const childNode = sourceFile.nodes[childId];
    if (childNode) {
      if (childNode.kind === ts.SyntaxKind.DotDotDotToken) {
        // 这是一个 rest 参数
        dotDotDotToken = ts.factory.createToken(ts.SyntaxKind.DotDotDotToken);
      } else if (childNode.kind === ts.SyntaxKind.ColonToken) {
        // 下一个节点应该是类型
        if (i + 1 < children.length) {
          const nextChildId = children[i + 1];
          if (nextChildId) {
            const typeNode = sourceFile.nodes[nextChildId];
            if (typeNode && isTypeNode(typeNode)) {
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
    modifiers.length > 0 ? modifiers : undefined, // modifiers
    dotDotDotToken, // dotDotDotToken
    name,
    undefined, // questionToken
    type,      // type
    initializer // initializer
  );
};
