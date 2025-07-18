import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { getNodeText } from '../utils/find-child';

/**
 * 创建字面量节点
 */
export const createLiteral: NodeBuilderFn<ts.Expression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.Expression => {
    const text = getNodeText(node);
    
    switch (node.kind) {
      case ts.SyntaxKind.StringLiteral:
        return ts.factory.createStringLiteral(text || '');
      case ts.SyntaxKind.NumericLiteral:
        return ts.factory.createNumericLiteral(text || '0');
      case ts.SyntaxKind.TrueKeyword:
        return ts.factory.createTrue();
      case ts.SyntaxKind.FalseKeyword:
        return ts.factory.createFalse();
      default:
        return ts.factory.createStringLiteral(text || '');
    }
  };
};
