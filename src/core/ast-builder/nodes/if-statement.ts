import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 IfStatement 节点
 * Kind: 245
 * 例子: if (condition) { ... } else { ... }
 */
export const createIfStatement: NodeBuilderFn<ts.IfStatement> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.IfStatement => {
    const children = node.children || [];
    
    if (children.length < 5) {
      throw new Error(`IfStatement should have at least 5 children (if, (, condition, ), thenStatement), got ${children.length}`);
    }
    
    // 结构：[if 关键字, (, 条件表达式, ), then 语句, ?else 语句]
    const conditionNodeId = children[2]!; // 跳过 if 和 (
    const thenStatementNodeId = children[4]!; // 跳过 if, (, condition, )
    
    const conditionNode = sourceFile.nodes[conditionNodeId];
    const thenStatementNode = sourceFile.nodes[thenStatementNodeId];
    
    if (!conditionNode) {
      throw new Error(`Condition node not found: ${conditionNodeId}`);
    }
    if (!thenStatementNode) {
      throw new Error(`Then statement node not found: ${thenStatementNodeId}`);
    }
    
    const condition = createNode(sourceFile, conditionNode) as ts.Expression;
    const thenStatement = createNode(sourceFile, thenStatementNode) as ts.Statement;
    
    // 检查是否有 else 语句
    let elseStatement: ts.Statement | undefined;
    if (children.length > 5) {
      const elseStatementNodeId = children[5]!;
      const elseStatementNode = sourceFile.nodes[elseStatementNodeId];
      if (elseStatementNode) {
        elseStatement = createNode(sourceFile, elseStatementNode) as ts.Statement;
      }
    }
    
    return ts.factory.createIfStatement(condition, thenStatement, elseStatement);
  };
};
