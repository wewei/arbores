import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { findChildByKind, getChildNodes } from '../utils/find-child';
import { getModifiers } from '../utils/modifiers';

/**
 * 创建函数声明节点
 */
export const createFunctionDeclaration: NodeBuilderFn<ts.FunctionDeclaration> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.FunctionDeclaration => {
    const children = getChildNodes(node, sourceFile);
    
    // 获取修饰符
    const modifiers = getModifiers(node.children || [], sourceFile, createNode);
    
    // 查找函数名
    const nameNode = findChildByKind(node.children || [], sourceFile, ts.SyntaxKind.Identifier);
    const name = nameNode ? (createNode(sourceFile, nameNode) as ts.Identifier) : ts.factory.createIdentifier('func');
    
    // 查找参数列表 - 需要更复杂的逻辑来解析参数
    const parameters: ts.ParameterDeclaration[] = [];
    
    // 查找函数体
    const bodyNode = findChildByKind(node.children || [], sourceFile, ts.SyntaxKind.Block);
    const body = bodyNode ? (createNode(sourceFile, bodyNode) as ts.Block) : undefined;
    
    // 查找返回类型 - 简化处理
    let type: ts.TypeNode | undefined;
    
    return ts.factory.createFunctionDeclaration(
      modifiers,
      undefined, // asterisk token for generator functions
      name,
      undefined, // type parameters
      parameters,
      type,
      body
    );
  };
};
