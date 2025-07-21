import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createForOfStatement: NodeBuilderFn<ts.ForOfStatement> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ForOfStatement => {
    const children = node.children || [];
    
    if (children.length < 7) {
      throw new Error(`ForOfStatement should have at least 7 children (for, (, initializer, of, expression, ), statement), got ${children.length}`);
    }
    
    // ForOfStatement 的标准结构：[for, (, initializer, of, expression, ), statement]
    // 0: for 关键字
    // 1: ( 开括号
    // 2: 变量声明 (const item)
    // 3: of 关键字  
    // 4: 迭代表达式 (items)
    // 5: ) 闭括号
    // 6: 循环体语句
    
    const initializerId = children[2]!;
    const expressionId = children[4]!;
    const statementId = children[6]!;
    
    // 创建初始化器（变量声明）
    const initializerNode = sourceFile.nodes[initializerId];
    if (!initializerNode) {
      throw new Error(`Initializer node ${initializerId} not found`);
    }
    const initializer = createNode(sourceFile, initializerNode) as ts.ForInitializer;
    
    // 创建迭代表达式
    const expressionNode = sourceFile.nodes[expressionId];
    if (!expressionNode) {
      throw new Error(`Expression node ${expressionId} not found`);
    }
    const expression = createNode(sourceFile, expressionNode) as ts.Expression;
    
    // 创建语句体
    const statementNode = sourceFile.nodes[statementId];
    if (!statementNode) {
      throw new Error(`Statement node ${statementId} not found`);
    }
    const statement = createNode(sourceFile, statementNode) as ts.Statement;
    
    return ts.factory.createForOfStatement(
      undefined, // awaitModifier
      initializer,
      expression,
      statement
    );
  };
};
