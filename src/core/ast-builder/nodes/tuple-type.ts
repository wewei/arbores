import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createTupleType: NodeBuilderFn<ts.TupleTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TupleTypeNode => {
    const children = node.children || [];
    
    if (children.length < 2) {
      throw new Error(`TupleType should have at least 2 children ([, elements, ]), got ${children.length}`);
    }
    
    // TupleType 的结构：[OpenBracketToken, SyntaxList with types, CloseBracketToken]
    let elementsId: string | undefined;
    
    // 寻找 SyntaxList 包含的类型元素
    for (const childId of children) {
      const childNode = sourceFile.nodes[childId];
      if (childNode && childNode.kind === ts.SyntaxKind.SyntaxList) {
        elementsId = childId;
        break;
      }
    }
    
    let elements: ts.TypeNode[] = [];
    
    if (elementsId) {
      const elementsNode = sourceFile.nodes[elementsId];
      if (elementsNode?.children) {
        elements = elementsNode.children
          .map(childId => {
            const elementNode = sourceFile.nodes[childId];
            if (elementNode) {
              return createNode(sourceFile, elementNode) as ts.TypeNode;
            }
            return null;
          })
          .filter((element): element is ts.TypeNode => element !== null);
      }
    }
    
    return ts.factory.createTupleTypeNode(elements);
  };
};
