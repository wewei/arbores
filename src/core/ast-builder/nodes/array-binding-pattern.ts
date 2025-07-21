import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createArrayBindingPattern: NodeBuilderFn<ts.ArrayBindingPattern> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ArrayBindingPattern => {
    const children = node.children || [];
    
    if (children.length < 2) {
      throw new Error(`ArrayBindingPattern should have at least 2 children ([, elements, ]), got ${children.length}`);
    }
    
    // ArrayBindingPattern 的结构：[OpenBracketToken, SyntaxList with elements, CloseBracketToken]
    let elementsId: string | undefined;
    
    // 寻找 SyntaxList 包含的绑定元素
    for (const childId of children) {
      const childNode = sourceFile.nodes[childId];
      if (childNode && childNode.kind === ts.SyntaxKind.SyntaxList) {
        elementsId = childId;
        break;
      }
    }
    
    let elements: ts.ArrayBindingElement[] = [];
    
    if (elementsId) {
      const elementsNode = sourceFile.nodes[elementsId];
      if (elementsNode?.children) {
        elements = elementsNode.children
          .map(childId => {
            const elementNode = sourceFile.nodes[childId];
            if (elementNode) {
              // BindingElement, OmittedExpression 等
              if (elementNode.kind === ts.SyntaxKind.BindingElement) {
                return createNode(sourceFile, elementNode) as ts.BindingElement;
              } else if (elementNode.kind === ts.SyntaxKind.OmittedExpression || !elementNode.text) {
                // 省略的元素，如 [a, , c] 中的第二个元素
                return ts.factory.createOmittedExpression();
              }
            }
            return null;
          })
          .filter((element): element is ts.ArrayBindingElement => element !== null);
      }
    }
    
    return ts.factory.createArrayBindingPattern(elements);
  };
};
