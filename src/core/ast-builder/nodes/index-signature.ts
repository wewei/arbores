import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createIndexSignature: NodeBuilderFn<ts.IndexSignatureDeclaration> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.IndexSignatureDeclaration => {
    const children = node.children || [];
    
    if (children.length < 3) {
      throw new Error(`IndexSignature should have at least 3 children ([, parameter, ]), got ${children.length}`);
    }
    
    // IndexSignature 的结构：[OpenBracketToken, SyntaxList with Parameter, CloseBracketToken, ColonToken, Type]
    let parameter: ts.ParameterDeclaration | undefined;
    let type: ts.TypeNode | undefined;
    
    // 查找参数和类型
    for (let i = 0; i < children.length; i++) {
      const childId = children[i];
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      if (childNode.kind === ts.SyntaxKind.Parameter) {
        parameter = createNode(sourceFile, childNode) as ts.ParameterDeclaration;
      } else if (childNode.kind === ts.SyntaxKind.SyntaxList && childNode.children) {
        // 在 SyntaxList 中查找 Parameter
        for (const syntaxListChildId of childNode.children) {
          const syntaxListChild = sourceFile.nodes[syntaxListChildId!];
          if (syntaxListChild?.kind === ts.SyntaxKind.Parameter) {
            parameter = createNode(sourceFile, syntaxListChild) as ts.ParameterDeclaration;
            break;
          }
        }
      } else if (childNode.kind === ts.SyntaxKind.ColonToken) {
        // 冒号后面的是类型
        if (i + 1 < children.length) {
          const typeId = children[i + 1];
          if (typeId) {
            const typeNode = sourceFile.nodes[typeId];
            if (typeNode) {
              type = createNode(sourceFile, typeNode) as ts.TypeNode;
            }
          }
        }
      }
    }
    
    if (!parameter) {
      throw new Error('IndexSignature missing parameter');
    }
    
    if (!type) {
      throw new Error('IndexSignature missing type');
    }
    
    return ts.factory.createIndexSignature(
      undefined, // modifiers
      [parameter],
      type
    );
  };
};
