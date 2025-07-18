import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, CreateSyntaxListFn } from '../types';
import { getChildNodes } from '../utils/find-child';

/**
 * 创建语法列表节点
 */
export const createSyntaxList: CreateSyntaxListFn = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.NodeArray<ts.Node> => {
    const childNodes = getChildNodes(node, sourceFile);
    const tsNodes: ts.Node[] = [];
    
    for (const childNode of childNodes) {
      try {
        const tsNode = createNode(sourceFile, childNode);
        if (tsNode) {
          tsNodes.push(tsNode);
        }
      } catch (error) {
        console.warn(`Failed to create node for ${ts.SyntaxKind[childNode.kind]}:`, error);
      }
    }
    
    return ts.factory.createNodeArray(tsNodes);
  };
};
