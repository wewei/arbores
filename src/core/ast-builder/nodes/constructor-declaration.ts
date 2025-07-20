import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 Constructor 节点
 * Kind: 176
 * 例子: constructor(private radius: number) { super(); }
 */
export const createConstructorDeclaration: NodeBuilderFn<ts.ConstructorDeclaration> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ConstructorDeclaration => {
    const children = node.children || [];
    
    if (children.length < 4) {
      throw new Error(`Constructor should have at least 4 children (constructor, (, ), body), got ${children.length}`);
    }
    
    // 查找参数列表
    let parametersNodeId: string | undefined;
    let bodyNodeId: string | undefined;
    
    // 遍历子节点找到参数列表和函数体
    for (let i = 0; i < children.length; i++) {
      const childId = children[i]!;
      const child = sourceFile.nodes[childId];
      if (!child) continue;
      
      // 查找 SyntaxList 作为参数列表（在括号之间）
      if (child.kind === ts.SyntaxKind.SyntaxList && !parametersNodeId) {
        parametersNodeId = childId;
      }
      // 查找 Block 作为函数体
      else if (child.kind === ts.SyntaxKind.Block) {
        bodyNodeId = childId;
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
    
    // 创建函数体
    let body: ts.Block | undefined;
    if (bodyNodeId) {
      const bodyNode = sourceFile.nodes[bodyNodeId];
      if (bodyNode) {
        body = createNode(sourceFile, bodyNode) as ts.Block;
      }
    }
    
    return ts.factory.createConstructorDeclaration(
      undefined, // modifiers - 如果有的话可以从节点中提取
      parameters,
      body
    );
  };
};
