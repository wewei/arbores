import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createTypeQuery: NodeBuilderFn<ts.TypeQueryNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TypeQueryNode => {
    const children = node.children || [];
    
    if (children.length < 2) {
      throw new Error(`TypeQuery should have at least 2 children (typeof, expression), got ${children.length}`);
    }
    
    // TypeQuery 的结构：[TypeOfKeyword, Expression]
    let exprName: ts.EntityName | undefined;
    
    // 寻找表达式（通常是第二个子节点，第一个是 typeof 关键字）
    for (let i = 0; i < children.length; i++) {
      const childId = children[i];
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      // 跳过 typeof 关键字，寻找表达式
      if (childNode.kind !== ts.SyntaxKind.TypeOfKeyword) {
        exprName = createNode(sourceFile, childNode) as ts.EntityName;
        break;
      }
    }
    
    if (!exprName) {
      throw new Error('TypeQuery missing expression name');
    }
    
    return ts.factory.createTypeQueryNode(exprName);
  };
};
