import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { isTypeNode } from '../utils';

/**
 * 创建变量声明节点
 * 
 * VariableDeclaration 结构 (可能的组合):
 * - 简单形式: [name, equals, initializer]
 * - 带类型: [name, colon, type, equals, initializer]
 * 
 * 示例: a = 1, name: string = "hello", user: User = {...}
 */
export const createVariableDeclaration: NodeBuilderFn<ts.VariableDeclaration> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.VariableDeclaration => {
  const children = node.children || [];
  
  if (children.length < 1) {
    throw new Error(`VariableDeclaration requires at least 1 child (name), got ${children.length}`);
  }

  // children[0] 总是变量名
  const nameNode = sourceFile.nodes[children[0]!];
  if (!nameNode) {
    throw new Error(`Cannot find variable name node with id: ${children[0]}`);
  }
  
  const name = createNode(sourceFile, nameNode) as ts.Identifier;
  let typeNode: ts.TypeNode | undefined;
  let initializer: ts.Expression | undefined;
  
  // 解析后续的节点
  let currentIndex = 1;
  
  while (currentIndex < children.length) {
    const childId = children[currentIndex];
    const childNode = sourceFile.nodes[childId!];
    if (!childNode) {
      currentIndex++;
      continue;
    }
    
    if (childNode.kind === ts.SyntaxKind.ColonToken) {
      // 跳过冒号，下一个应该是类型
      currentIndex++;
      if (currentIndex < children.length) {
        const typeChildId = children[currentIndex];
        const typeChildNode = sourceFile.nodes[typeChildId!];
        if (typeChildNode && isTypeNode(typeChildNode)) {
          typeNode = createNode(sourceFile, typeChildNode) as ts.TypeNode;
        }
      }
    } else if (childNode.kind === ts.SyntaxKind.EqualsToken) {
      // 跳过等号，下一个应该是初始化表达式
      currentIndex++;
      if (currentIndex < children.length) {
        const initChildId = children[currentIndex];
        const initChildNode = sourceFile.nodes[initChildId!];
        if (initChildNode) {
          initializer = createNode(sourceFile, initChildNode) as ts.Expression;
        }
      }
      break; // 找到初始化表达式后停止
    }
    
    currentIndex++;
  }

  return ts.factory.createVariableDeclaration(name, undefined, typeNode, initializer);
};
