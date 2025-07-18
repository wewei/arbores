import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { getModifiers, findChildByKind } from '../utils';
import { createParameterNode } from './parameter';
import { createBlockNode } from './block';
import { createTypeReferenceNode } from './type-reference';

// 创建函数声明节点
export function createFunctionDeclarationNode(node: ASTNode, ast: SourceFileAST): ts.FunctionDeclaration {
  const children = node.children || [];
  const modifiers = getModifiers(children, ast);
  const nameNode = findChildByKind(children, ast, ts.SyntaxKind.Identifier);
  const parameters = findChildByKind(children, ast, ts.SyntaxKind.SyntaxList);
  const bodyNode = findChildByKind(children, ast, ts.SyntaxKind.Block);

  // 解析参数列表 - 查找在 OpenParenToken 和 CloseParenToken 之间的 SyntaxList
  const parameterList: ts.ParameterDeclaration[] = [];
  const openParenIndex = children.findIndex(childId => {
    const childNode = ast.nodes[childId];
    return childNode && childNode.kind === ts.SyntaxKind.OpenParenToken;
  });
  const closeParenIndex = children.findIndex(childId => {
    const childNode = ast.nodes[childId];
    return childNode && childNode.kind === ts.SyntaxKind.CloseParenToken;
  });
  
  if (openParenIndex !== -1 && closeParenIndex !== -1) {
    for (let i = openParenIndex + 1; i < closeParenIndex; i++) {
      const childId = children[i];
      if (childId) {
        const childNode = ast.nodes[childId];
        if (childNode && childNode.kind === ts.SyntaxKind.SyntaxList && childNode.children) {
          for (const paramChildId of childNode.children) {
            const paramChildNode = ast.nodes[paramChildId];
            if (paramChildNode && paramChildNode.kind === ts.SyntaxKind.Parameter) {
              parameterList.push(createParameterNode(paramChildNode, ast));
            }
          }
        }
      }
    }
  }

  // 解析返回类型
  let typeNode: ts.TypeNode | undefined;
  const colonIndex = children.findIndex(childId => {
    const childNode = ast.nodes[childId];
    return childNode && childNode.kind === ts.SyntaxKind.ColonToken;
  });
  if (colonIndex !== -1 && colonIndex + 1 < children.length) {
    const typeAstNodeId = children[colonIndex + 1];
    if (typeAstNodeId) {
      const typeAstNode = ast.nodes[typeAstNodeId];
      if (typeAstNode) {
        switch (typeAstNode.kind) {
          case ts.SyntaxKind.NumberKeyword:
            typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
            break;
          case ts.SyntaxKind.StringKeyword:
            typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
            break;
          case ts.SyntaxKind.TypeReference:
            typeNode = createTypeReferenceNode(typeAstNode, ast);
            break;
          // 可扩展其它类型
          default:
            break;
        }
      }
    }
  }

  // 解析函数体
  let functionBody: ts.Block | undefined;
  if (bodyNode) {
    functionBody = createBlockNode(bodyNode, ast);
  }

  return ts.factory.createFunctionDeclaration(
    modifiers,
    undefined, // asteriskToken
    nameNode ? ts.factory.createIdentifier(nameNode.text || '') : undefined,
    undefined, // typeParameters
    parameterList,
    typeNode,
    functionBody
  );
} 