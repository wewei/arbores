import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createForOfStatement: NodeBuilderFn<ts.ForOfStatement> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ForOfStatement => {
    const children = node.children || [];
    
    if (children.length < 4) {
      throw new Error(`ForOfStatement should have at least 4 children, got ${children.length}`);
    }
    
    // ForOfStatement 的结构：for (initializer of expression) statement
    // 跳过 for 关键字和括号，寻找关键部分
    let initializerId: string | undefined;
    let expressionId: string | undefined;
    let statementId: string | undefined;
    
    // 简化方法：寻找变量声明和表达式
    for (let i = 0; i < children.length; i++) {
      const childId = children[i];
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      // 寻找变量声明列表 (for-of 的左侧)
      if (childNode.kind === ts.SyntaxKind.VariableDeclarationList && !initializerId) {
        initializerId = childId;
      }
      // 寻找要迭代的表达式 (for-of 的右侧)
      else if (!initializerId && (
        childNode.kind === ts.SyntaxKind.Identifier ||
        childNode.kind === ts.SyntaxKind.PropertyAccessExpression ||
        childNode.kind === ts.SyntaxKind.ArrayLiteralExpression
      )) {
        // 这可能是初始化器或表达式，先假设是初始化器
        if (!initializerId) {
          initializerId = childId;
        } else if (!expressionId) {
          expressionId = childId;
        }
      }
      // 寻找循环体 (block 或其他语句)
      else if (childNode.kind === ts.SyntaxKind.Block || childNode.kind === ts.SyntaxKind.ExpressionStatement) {
        statementId = childId;
      }
    }
    
    // 如果还没找到表达式，尝试其他方法
    if (!expressionId && children.length >= 4) {
      // 尝试找到 of 关键字后面的表达式
      for (let i = 1; i < children.length - 1; i++) {
        const childId = children[i];
        if (!childId) continue;
        
        const childNode = sourceFile.nodes[childId];
        if (childNode && childId !== initializerId && childId !== statementId) {
          expressionId = childId;
          break;
        }
      }
    }
    
    if (!initializerId || !expressionId) {
      throw new Error('ForOfStatement missing required initializer or expression');
    }
    
    // 创建初始化器
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
    let statement: ts.Statement;
    if (statementId) {
      const statementNode = sourceFile.nodes[statementId];
      if (statementNode) {
        statement = createNode(sourceFile, statementNode) as ts.Statement;
      } else {
        statement = ts.factory.createBlock([]);
      }
    } else {
      // 如果没有语句体，创建一个空块
      statement = ts.factory.createBlock([]);
    }
    
    return ts.factory.createForOfStatement(
      undefined, // awaitModifier
      initializer,
      expression,
      statement
    );
  };
};
