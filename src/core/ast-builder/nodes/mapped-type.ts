import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createMappedType: NodeBuilderFn<ts.MappedTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.MappedTypeNode => {
    const children = node.children || [];
    
    if (children.length < 2) {
      throw new Error(`MappedType should have at least 2 children, got ${children.length}`);
    }
    
    let typeParameter: ts.TypeParameterDeclaration | undefined;
    let type: ts.TypeNode | undefined;
    let questionToken: ts.QuestionToken | ts.MinusToken | undefined;
    let readonlyToken: ts.ReadonlyKeyword | ts.PlusToken | ts.MinusToken | undefined;
    
    for (let i = 0; i < children.length; i++) {
      const childId = children[i];
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      // 跳过标点符号 tokens
      if (childNode.kind === ts.SyntaxKind.OpenBraceToken ||
          childNode.kind === ts.SyntaxKind.CloseBraceToken ||
          childNode.kind === ts.SyntaxKind.OpenBracketToken ||
          childNode.kind === ts.SyntaxKind.CloseBracketToken ||
          childNode.kind === ts.SyntaxKind.ColonToken ||
          childNode.kind === ts.SyntaxKind.SemicolonToken) {
        continue;
      }
      
      // 处理可选性修饰符
      if (childNode.kind === ts.SyntaxKind.QuestionToken) {
        questionToken = ts.factory.createToken(ts.SyntaxKind.QuestionToken);
        continue;
      }
      
      if (childNode.kind === ts.SyntaxKind.MinusToken) {
        // 检查下一个节点是否是 ? (表示 -?)
        const nextChildId = children[i + 1];
        const nextChildNode = nextChildId ? sourceFile.nodes[nextChildId] : null;
        if (nextChildNode?.kind === ts.SyntaxKind.QuestionToken) {
          questionToken = ts.factory.createToken(ts.SyntaxKind.MinusToken);
          i++; // 跳过下一个 ? token
          continue;
        }
      }
      
      // 处理 TypeParameter (包含 K in keyof T)
      if (childNode.kind === ts.SyntaxKind.TypeParameter && !typeParameter) {
        typeParameter = createNode(sourceFile, childNode) as ts.TypeParameterDeclaration;
        continue;
      }
      
      // 处理值类型 
      if (!type && childNode.kind !== ts.SyntaxKind.TypeParameter) {
        try {
          const candidateType = createNode(sourceFile, childNode) as ts.TypeNode;
          // 避免将类型参数的约束当作值类型
          if (candidateType) {
            type = candidateType;
          }
        } catch {
          // 如果不能作为类型节点处理，继续下一个
        }
      }
    }
    
    // 如果没有找到类型参数，创建默认的
    if (!typeParameter) {
      typeParameter = ts.factory.createTypeParameterDeclaration(
        undefined,
        ts.factory.createIdentifier('K'),
        ts.factory.createTypeOperatorNode(
          ts.SyntaxKind.KeyOfKeyword,
          ts.factory.createTypeReferenceNode('T')
        ),
        undefined
      );
    }
    
    if (!type) {
      type = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    }
    
    return ts.factory.createMappedTypeNode(
      readonlyToken,
      typeParameter,
      undefined, // nameType
      questionToken,
      type,
      undefined  // members
    );
  };
};
