import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 FunctionType 节点
 * Kind: 184
 * 例子: (value: T, index: number, array: T[]) => U
 */
export const createFunctionType: NodeBuilderFn<ts.FunctionTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.FunctionTypeNode => {
    const children = node.children || [];
    
    if (children.length < 5) {
      throw new Error(`FunctionType should have at least 5 children (openParen, parameters, closeParen, =>, returnType), got ${children.length}`);
    }
    
    // 查找参数列表和返回类型
    let parametersNodeId: string | undefined;
    let returnTypeNodeId: string | undefined;
    
    // 遍历子节点找到参数列表（SyntaxList）和返回类型
    for (let i = 0; i < children.length; i++) {
      const childId = children[i]!;
      const child = sourceFile.nodes[childId];
      if (!child) continue;
      
      // 查找 SyntaxList 作为参数列表（在括号之间）
      if (child.kind === ts.SyntaxKind.SyntaxList && !parametersNodeId) {
        parametersNodeId = childId;
      }
      // 查找返回类型（在 => 之后）
      else if (i === children.length - 1) {
        returnTypeNodeId = childId;
      }
    }
    
    // 创建参数列表
    const parameters: ts.ParameterDeclaration[] = [];
    if (parametersNodeId) {
      const parametersNode = sourceFile.nodes[parametersNodeId];
      if (parametersNode && parametersNode.children) {
        for (const paramId of parametersNode.children) {
          const paramNode = sourceFile.nodes[paramId];
          if (paramNode && paramNode.kind === ts.SyntaxKind.Parameter) {
            const param = createNode(sourceFile, paramNode) as ts.ParameterDeclaration;
            parameters.push(param);
          }
        }
      }
    }
    
    // 创建返回类型
    let returnType: ts.TypeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    if (returnTypeNodeId) {
      const returnTypeNode = sourceFile.nodes[returnTypeNodeId];
      if (returnTypeNode) {
        returnType = createNode(sourceFile, returnTypeNode) as ts.TypeNode;
      }
    }
    
    return ts.factory.createFunctionTypeNode(
      undefined, // type parameters
      parameters,
      returnType
    );
  };
};
