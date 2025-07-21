import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { getModifiers } from '../utils';

export const createTypeAliasDeclaration: NodeBuilderFn<ts.TypeAliasDeclaration> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TypeAliasDeclaration => {
    const children = node.children || [];
    
    // 获取修饰符
    const modifiers = getModifiers(children, sourceFile, createNode);
    
    if (children.length < 4) {
      throw new Error(`TypeAliasDeclaration should have at least 4 children (type, name, =, type), got ${children.length}`);
    }

    // 找到 Identifier, EqualsToken, TypeNode
    let nameIndex = -1;
    let equalsIndex = -1;
    
    for (let i = 0; i < children.length; i++) {
      const childId = children[i];
      if (childId) {
        const childNode = sourceFile.nodes[childId];
        if (childNode) {
          if (childNode.kind === ts.SyntaxKind.Identifier && nameIndex === -1) {
            nameIndex = i;
          } else if (childNode.kind === ts.SyntaxKind.EqualsToken && equalsIndex === -1) {
            equalsIndex = i;
          }
        }
      }
    }
    
    if (nameIndex === -1 || equalsIndex === -1) {
      throw new Error(`Could not find required elements in TypeAliasDeclaration`);
    }

    const nameId = children[nameIndex];
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
    if (equalsIndex > nameIndex + 1) {
      // 查找类型参数
      typeParameters = [];
      for (let i = nameIndex + 1; i < equalsIndex; i++) {
        const childId = children[i];
        if (!childId) continue;
        
        const childNode = sourceFile.nodes[childId];
        if (!childNode) continue;
        
        if (childNode.kind === ts.SyntaxKind.TypeParameter) {
          const typeParameter = createNode(sourceFile, childNode) as ts.TypeParameterDeclaration;
          typeParameters.push(typeParameter);
        } else if (childNode.kind === ts.SyntaxKind.SyntaxList) {
          // 处理 SyntaxList，它可能包含类型参数
          const syntaxListChildren = childNode.children || [];
          for (const specifierId of syntaxListChildren) {
            const specifierNode = sourceFile.nodes[specifierId];
            if (!specifierNode) continue;
            
            if (specifierNode.kind === ts.SyntaxKind.TypeParameter) {
              const typeParameter = createNode(sourceFile, specifierNode) as ts.TypeParameterDeclaration;
              typeParameters.push(typeParameter);
            }
          }
        }
      }
      
      // 如果没有找到类型参数，设为 undefined
      if (typeParameters.length === 0) {
        typeParameters = undefined;
      }
    }
    
    return ts.factory.createTypeAliasDeclaration(
      modifiers.length > 0 ? modifiers : undefined,
      name,
      typeParameters,
      type
    );
  };
};
