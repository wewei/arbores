import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 ForStatement 节点
 * Kind: 248
 * 例子: for (let i = 0; i < array.length; i++) { ... }
 */
export const createForStatement: NodeBuilderFn<ts.ForStatement> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ForStatement => {
    const children = node.children || [];
    
    if (children.length < 9) {
      throw new Error(`ForStatement should have at least 9 children (for, (, initializer, ;, condition, ;, incrementor, ), statement), got ${children.length}`);
    }
    
    // 结构：[for关键字, (, 初始化器, ;, 条件, ;, 增量, ), 语句]
    const initializerNodeId = children[2]; // 跳过 for 和 (
    const conditionNodeId = children[4]; // 跳过初始化器和 ;
    const incrementorNodeId = children[6]; // 跳过条件和 ;
    const statementNodeId = children[8]; // 跳过增量和 )
    
    // 创建初始化器 (可选)
    let initializer: ts.ForInitializer | undefined;
    if (initializerNodeId) {
      const initializerNode = sourceFile.nodes[initializerNodeId];
      if (initializerNode) {
        initializer = createNode(sourceFile, initializerNode) as ts.ForInitializer;
      }
    }
    
    // 创建条件 (可选)
    let condition: ts.Expression | undefined;
    if (conditionNodeId) {
      const conditionNode = sourceFile.nodes[conditionNodeId];
      if (conditionNode) {
        condition = createNode(sourceFile, conditionNode) as ts.Expression;
      }
    }
    
    // 创建增量 (可选)
    let incrementor: ts.Expression | undefined;
    if (incrementorNodeId) {
      const incrementorNode = sourceFile.nodes[incrementorNodeId];
      if (incrementorNode) {
        incrementor = createNode(sourceFile, incrementorNode) as ts.Expression;
      }
    }
    
    // 创建语句
    const statementNode = sourceFile.nodes[statementNodeId!];
    if (!statementNode) {
      throw new Error(`ForStatement: statement node not found: ${statementNodeId}`);
    }
    const statement = createNode(sourceFile, statementNode) as ts.Statement;
    
    return ts.factory.createForStatement(
      initializer,
      condition,
      incrementor,
      statement
    );
  };
};
