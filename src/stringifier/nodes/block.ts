import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { createReturnStatementNode } from './return-statement';
import { createExpressionStatementNode } from './expression-statement';
import { createVariableStatementNode } from './variable-statement';

// 创建块节点
export function createBlockNode(node: ASTNode, ast: SourceFileAST): ts.Block {
  let statements: ts.Statement[] = [];
  
  if (node.children) {
    // 查找 SyntaxList，Block 的 children 通常是一个 SyntaxList
    const syntaxListNode = node.children
      .map(id => ast.nodes[id])
      .find(child => child && child.kind === ts.SyntaxKind.SyntaxList);
    
    if (syntaxListNode && syntaxListNode.children) {
      for (const stmtId of syntaxListNode.children) {
        const stmtNode = ast.nodes[stmtId];
        if (!stmtNode) continue;
        
        switch (stmtNode.kind) {
          case ts.SyntaxKind.ReturnStatement:
            statements.push(createReturnStatementNode(stmtNode, ast));
            break;
          case ts.SyntaxKind.ExpressionStatement:
            statements.push(createExpressionStatementNode(stmtNode, ast));
            break;
          case ts.SyntaxKind.VariableStatement:
            statements.push(createVariableStatementNode(stmtNode, ast));
            break;
          default:
            // 对于不支持的语句类型，创建空语句
            statements.push(ts.factory.createEmptyStatement());
        }
      }
    }
  }
  
  return ts.factory.createBlock(statements, true);
} 