import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { findChildByKind, getChildNodes } from '../utils/find-child';

/**
 * 创建变量声明节点
 */
export const createVariableDeclaration: NodeBuilderFn<ts.VariableDeclaration> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.VariableDeclaration => {
    const children = getChildNodes(node, sourceFile);
    
    // 查找变量名
    const nameNode = findChildByKind(node.children || [], sourceFile, ts.SyntaxKind.Identifier);
    const name = nameNode ? (createNode(sourceFile, nameNode) as ts.Identifier) : ts.factory.createIdentifier('variable');
    
    // 查找类型注解（如果有的话）
    let type: ts.TypeNode | undefined;
    
    // 查找初始化表达式
    let initializer: ts.Expression | undefined;
    let foundEquals = false;
    
    for (const child of children) {
      if (child.kind === ts.SyntaxKind.EqualsToken) {
        foundEquals = true;
        continue;
      }
      
      if (foundEquals) {
        // 在等号之后的第一个表达式是初始化器
        initializer = createNode(sourceFile, child) as ts.Expression;
        break;
      }
      
      // 类型注解在冒号后面
      if (child.kind === ts.SyntaxKind.ColonToken) {
        // 下一个节点应该是类型
        continue;
      }
    }
    
    return ts.factory.createVariableDeclaration(name, undefined, type, initializer);
  };
};
