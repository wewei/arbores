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
  
  // TODO: 处理类型注解和默认值
  // 目前只处理简单的参数名
  
  return ts.factory.createParameterDeclaration(
    undefined, // modifiers
    undefined, // dotDotDotToken
    name,
    undefined, // questionToken
    undefined, // type
    undefined  // initializer
  );
};
