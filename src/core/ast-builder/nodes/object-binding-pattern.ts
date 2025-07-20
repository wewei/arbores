import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createObjectBindingPattern: NodeBuilderFn<ts.ObjectBindingPattern> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ObjectBindingPattern => {
    const children = node.children || [];
    
    if (children.length < 3) {
      throw new Error(`ObjectBindingPattern should have at least 3 children ({, elements, }), got ${children.length}`);
    }
    
    // ObjectBindingPattern的结构：[{, elements, }]
    const openBraceId = children[0];
    const elementsId = children[1]; 
    const closeBraceId = children[2];
    
    if (!elementsId) {
      throw new Error('ObjectBindingPattern missing elements');
    }
    
    // 创建绑定元素列表
    const elementsNode = sourceFile.nodes[elementsId];
    const elements: ts.BindingElement[] = [];
    
    if (elementsNode && elementsNode.children) {
      for (const elementId of elementsNode.children) {
        if (!elementId) continue;
        
        const elementNode = sourceFile.nodes[elementId];
        if (!elementNode) continue;
        
        // 跳过逗号token
        if (elementNode.kind === ts.SyntaxKind.CommaToken) {
          continue;
        }
        
        // 创建绑定元素
        const element = createNode(sourceFile, elementNode) as ts.BindingElement;
        elements.push(element);
      }
    }
    
    return ts.factory.createObjectBindingPattern(elements);
  };
};
