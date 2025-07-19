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
    
    // 查找参数列表 - 改进参数解析
    const parameters: ts.ParameterDeclaration[] = [];
    
    // 查找 SyntaxList 中的参数
    const syntaxLists = (node.children || []).filter(childId => {
      const child = sourceFile.nodes[childId];
      return child && child.kind === ts.SyntaxKind.SyntaxList;
    });
    
    // 遍历 SyntaxList 查找参数
    for (const listId of syntaxLists) {
      const listNode = sourceFile.nodes[listId];
      if (listNode?.children) {
        for (const paramId of listNode.children) {
          const paramNode = sourceFile.nodes[paramId];
          if (paramNode && paramNode.kind === ts.SyntaxKind.Parameter) {
            const param = createNode(sourceFile, paramNode) as ts.ParameterDeclaration;
            parameters.push(param);
          }
        }
      }
    }
    
    // 查找函数体
    const bodyNode = findChildByKind(node.children || [], sourceFile, ts.SyntaxKind.Block);
    const body = bodyNode ? (createNode(sourceFile, bodyNode) as ts.Block) : undefined;
    
    // 查找返回类型 - 改进类型处理
    let type: ts.TypeNode | undefined;
    
    // 在子节点中查找返回类型（通常在冒号之后）
    const childIds = node.children || [];
    for (let i = 0; i < childIds.length - 1; i++) {
      const childId = childIds[i];
      if (!childId) continue;
      
      const childNode = sourceFile.nodes[childId];
      if (childNode && childNode.kind === ts.SyntaxKind.ColonToken) {
        // 下一个节点可能是返回类型
        const nextChildId = childIds[i + 1];
        if (nextChildId) {
          const typeNode = sourceFile.nodes[nextChildId];
          if (typeNode && (
            typeNode.kind === ts.SyntaxKind.StringKeyword ||
            typeNode.kind === ts.SyntaxKind.NumberKeyword ||
            typeNode.kind === ts.SyntaxKind.BooleanKeyword ||
            typeNode.kind === ts.SyntaxKind.TypeReference ||
            typeNode.kind === ts.SyntaxKind.TypePredicate ||
            typeNode.kind === ts.SyntaxKind.UnionType ||
            typeNode.kind === ts.SyntaxKind.LiteralType ||
            typeNode.kind === ts.SyntaxKind.AnyKeyword ||
            typeNode.kind === ts.SyntaxKind.VoidKeyword ||
            typeNode.kind === ts.SyntaxKind.UnknownKeyword ||
            typeNode.kind === ts.SyntaxKind.NeverKeyword
          )) {
            type = createNode(sourceFile, typeNode) as ts.TypeNode;
            break;
          }
        }
      }
    }
    
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
