import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createMethodSignature: NodeBuilderFn<ts.MethodSignature> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.MethodSignature => {
    const children = node.children || [];
    
    if (children.length < 4) {
      throw new Error(`MethodSignature should have at least 4 children (name, (, params, )), got ${children.length}`);
    }
    
    // MethodSignature的结构：[name, (, parameters, ), :?, returnType?, ;?]
    const nameId = children[0];
    const openParenId = children[1];
    const parametersId = children[2];
    const closeParenId = children[3];
    
    let colonId: string | undefined;
    let returnTypeId: string | undefined;
    
    // 查找可选的返回类型
    for (let i = 4; i < children.length; i++) {
      const childId = children[i];
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      if (childNode.kind === ts.SyntaxKind.ColonToken) {
        colonId = childId;
        if (i + 1 < children.length) {
          const nextChildId = children[i + 1];
          if (nextChildId) {
            const nextChild = sourceFile.nodes[nextChildId];
            if (nextChild && nextChild.kind !== ts.SyntaxKind.SemicolonToken) {
              returnTypeId = nextChildId;
            }
          }
        }
        break;
      }
    }
    
    if (!nameId || !parametersId) {
      throw new Error('MethodSignature missing required children');
    }
    
    // 创建名称
    const nameNode = sourceFile.nodes[nameId];
    if (!nameNode) {
      throw new Error(`Name node ${nameId} not found`);
    }
    const name = createNode(sourceFile, nameNode) as ts.PropertyName;
    
    // 创建参数列表
    const parametersNode = sourceFile.nodes[parametersId];
    let parameters: ts.ParameterDeclaration[] = [];
    if (parametersNode && parametersNode.children) {
      for (const paramId of parametersNode.children) {
        if (!paramId) continue;
        const paramNode = sourceFile.nodes[paramId];
        if (!paramNode) continue;
        
        // 跳过逗号token
        if (paramNode.kind === ts.SyntaxKind.CommaToken) {
          continue;
        }
        
        const parameter = createNode(sourceFile, paramNode) as ts.ParameterDeclaration;
        parameters.push(parameter);
      }
    }
    
    // 创建返回类型（如果存在）
    let type: ts.TypeNode | undefined;
    if (returnTypeId) {
      const returnTypeNode = sourceFile.nodes[returnTypeId];
      if (returnTypeNode) {
        type = createNode(sourceFile, returnTypeNode) as ts.TypeNode;
      }
    }
    
    return ts.factory.createMethodSignature(
      undefined, // modifiers
      name,
      undefined, // questionToken
      undefined, // typeParameters
      parameters,
      type
    );
  };
};
