import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 ModuleBlock 节点
 * Kind: 268
 * 例子: { export interface Point { ... } }
 */
export const createModuleBlock: NodeBuilderFn<ts.ModuleBlock> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ModuleBlock => {
    const children = node.children || [];
    
    // 查找 SyntaxList 作为语句列表（跳过大括号）
    let statementsNodeId: string | undefined;
    
    for (const childId of children) {
      const child = sourceFile.nodes[childId];
      if (child && child.kind === ts.SyntaxKind.SyntaxList) {
        statementsNodeId = childId;
        break;
      }
    }
    
    // 创建语句列表
    const statements: ts.Statement[] = [];
    if (statementsNodeId) {
      const statementsNode = sourceFile.nodes[statementsNodeId];
      if (statementsNode && statementsNode.children) {
        for (const stmtId of statementsNode.children) {
          const stmtNode = sourceFile.nodes[stmtId];
          if (stmtNode) {
            const statement = createNode(sourceFile, stmtNode) as ts.Statement;
            statements.push(statement);
          }
        }
      }
    }
    
    return ts.factory.createModuleBlock(statements);
  };
};
