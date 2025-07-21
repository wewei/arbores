import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 HeritageClause 节点
 * Kind: 298
 * 例子: extends BaseClass, implements IInterface
 */
export const createHeritageClause: NodeBuilderFn<ts.HeritageClause> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.HeritageClause => {
    const children = node.children || [];
    
    if (children.length < 1) {
      throw new Error('HeritageClause should have at least 1 child (token)');
    }
    
    // 第一个子节点应该是 extends 或 implements token
    const tokenNodeId = children[0]!;
    const tokenNode = sourceFile.nodes[tokenNodeId];
    
    if (!tokenNode) {
      throw new Error(`HeritageClause: token node not found: ${tokenNodeId}`);
    }
    
    // 获取 heritage clause token (extends/implements)
    let token: ts.SyntaxKind;
    if (tokenNode.kind === ts.SyntaxKind.ExtendsKeyword) {
      token = ts.SyntaxKind.ExtendsKeyword;
    } else if (tokenNode.kind === ts.SyntaxKind.ImplementsKeyword) {
      token = ts.SyntaxKind.ImplementsKeyword;
    } else {
      throw new Error(`Unexpected heritage clause token: ${ts.SyntaxKind[tokenNode.kind]}`);
    }
    
    // 收集类型节点
    const types: ts.ExpressionWithTypeArguments[] = [];
    for (let i = 1; i < children.length; i++) {
      const childId = children[i];
      const childNode = sourceFile.nodes[childId!];
      if (!childNode) continue;
      
      if (childNode.kind === ts.SyntaxKind.ExpressionWithTypeArguments) {
        types.push(createNode(sourceFile, childNode) as ts.ExpressionWithTypeArguments);
      } else if (childNode.kind === ts.SyntaxKind.SyntaxList) {
        // 处理 SyntaxList 中的类型节点
        const syntaxListChildren = childNode.children || [];
        for (const typeId of syntaxListChildren) {
          const typeNode = sourceFile.nodes[typeId];
          if (!typeNode) continue;
          
          if (typeNode.kind === ts.SyntaxKind.ExpressionWithTypeArguments) {
            types.push(createNode(sourceFile, typeNode) as ts.ExpressionWithTypeArguments);
          }
        }
      }
    }
    
    return ts.factory.createHeritageClause(token, types);
  };
};
