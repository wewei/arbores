import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createTypeAliasDeclaration: NodeBuilderFn<ts.TypeAliasDeclaration> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TypeAliasDeclaration => {
    const children = node.children || [];
    
    if (children.length < 4) {
      throw new Error(`TypeAliasDeclaration should have at least 4 children (type, name, =, type), got ${children.length}`);
    }
    
    // TypeAliasDeclaration的结构：[type关键字, 名称, 类型参数?, =, 类型, ;?]
    const typeKeywordId = children[0];
    const nameId = children[1];
    
    // 找到等号的位置
    let equalsIndex = -1;
    for (let i = 2; i < children.length; i++) {
      const childId = children[i];
      if (childId) {
        const childNode = sourceFile.nodes[childId];
        if (childNode && childNode.kind === ts.SyntaxKind.EqualsToken) {
          equalsIndex = i;
          break;
        }
      }
    }
    
    if (equalsIndex === -1) {
      throw new Error('TypeAliasDeclaration missing equals token');
    }
    
    const typeNodeId = children[equalsIndex + 1];
    
    if (!nameId || !typeNodeId) {
      throw new Error('TypeAliasDeclaration missing required children');
    }
    
    // 创建名称
    const nameNode = sourceFile.nodes[nameId];
    if (!nameNode) {
      throw new Error(`Name node ${nameId} not found`);
    }
    const name = createNode(sourceFile, nameNode) as ts.Identifier;
    
    // 创建类型
    const typeNode = sourceFile.nodes[typeNodeId];
    if (!typeNode) {
      throw new Error(`Type node ${typeNodeId} not found`);
    }
    const type = createNode(sourceFile, typeNode) as ts.TypeNode;
    
    // 检查是否有类型参数（在名称和等号之间）
    let typeParameters: ts.TypeParameterDeclaration[] | undefined;
    if (equalsIndex > 2) {
      // 可能有类型参数
      const typeParamId = children[2];
      if (typeParamId) {
        const typeParamNode = sourceFile.nodes[typeParamId];
        if (typeParamNode && typeParamNode.kind !== ts.SyntaxKind.EqualsToken) {
          // 这是类型参数，但现在先忽略，因为它可能很复杂
          typeParameters = undefined;
        }
      }
    }
    
    return ts.factory.createTypeAliasDeclaration(
      undefined, // modifiers  
      name,
      typeParameters,
      type
    );
  };
};
