import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建方法声明节点
 * 
 * MethodDeclaration 结构:
 * - 方法名
 * - 参数列表
 * - 返回类型
 * - 方法体
 * 
 * 示例: add(x: number): number { ... }
 */
export const createMethodDeclaration: NodeBuilderFn<ts.MethodDeclaration> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.MethodDeclaration => {
  const children = node.children || [];
  let methodName: ts.PropertyName | undefined;
  const parameters: ts.ParameterDeclaration[] = [];
  let body: ts.Block | undefined;
  
  // 查找方法名
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (child && child.kind === ts.SyntaxKind.Identifier) {
      methodName = createNode(sourceFile, child) as ts.PropertyName;
      break;
    }
  }
  
  // 查找参数和方法体
  const findElements = (nodeId: string): void => {
    const child = sourceFile.nodes[nodeId];
    if (!child) return;
    
    if (child.kind === ts.SyntaxKind.Parameter) {
      try {
        const param = createNode(sourceFile, child) as ts.ParameterDeclaration;
        parameters.push(param);
      } catch (error) {
        // 忽略无法创建的参数
      }
    } else if (child.kind === ts.SyntaxKind.Block) {
      try {
        body = createNode(sourceFile, child) as ts.Block;
      } catch (error) {
        // 忽略无法创建的方法体
      }
    } else if (child.children) {
      for (const grandChildId of child.children) {
        findElements(grandChildId);
      }
    }
  };
  
  for (const childId of children) {
    findElements(childId);
  }
  
  if (!methodName) {
    methodName = ts.factory.createIdentifier('method');
  }
  
  if (!body) {
    body = ts.factory.createBlock([]);
  }
  
  return ts.factory.createMethodDeclaration(
    undefined, // modifiers
    undefined, // asterisk token
    methodName,
    undefined, // question token
    undefined, // type parameters
    parameters,
    undefined, // type
    body
  );
};
