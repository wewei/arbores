import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { findChildByKind, getChildNodes } from '../utils/find-child';

/**
 * 创建返回语句节点
 */
export const createReturnStatement: NodeBuilderFn<ts.ReturnStatement> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ReturnStatement => {
    const children = getChildNodes(node, sourceFile);
    
    // 查找返回表达式
    let expression: ts.Expression | undefined;
    
    for (const child of children) {
      // 跳过 ReturnKeyword 和 SemicolonToken
      if (child.kind !== ts.SyntaxKind.ReturnKeyword && 
          child.kind !== ts.SyntaxKind.SemicolonToken) {
        expression = createNode(sourceFile, child) as ts.Expression;
        break;
      }
    }
    
    return ts.factory.createReturnStatement(expression);
  };
};
