import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建变量声明节点
 * 
 * VariableDeclaration 结构:
 * - children[0]: 变量名 (Identifier)
 * - children[1]: 等号 (EqualsToken) 
 * - children[2]: 初始化表达式
 * 
 * 示例: a = 1, name = "hello"
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

  // children[0] 是变量名
  const nameNode = sourceFile.nodes[children[0]!];
  if (!nameNode) {
    throw new Error(`Cannot find variable name node with id: ${children[0]}`);
  }
  
  const name = createNode(sourceFile, nameNode) as ts.Identifier;
  
  // children[2] 是初始化表达式（如果有的话）
  let initializer: ts.Expression | undefined;
  if (children.length >= 3) {
    const initializerNode = sourceFile.nodes[children[2]!];
    if (initializerNode) {
      initializer = createNode(sourceFile, initializerNode) as ts.Expression;
    }
  }

  return ts.factory.createVariableDeclaration(name, undefined, undefined, initializer);
};
