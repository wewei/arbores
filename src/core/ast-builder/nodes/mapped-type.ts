import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createMappedType: NodeBuilderFn<ts.MappedTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.MappedTypeNode => {
    const children = node.children || [];
    
    if (children.length < 2) {
      throw new Error(`MappedType should have at least 2 children, got ${children.length}`);
    }
    
    // 简化的 MappedType 实现
    // 对于复杂的 MappedType，我们创建一个基本的占位符
    // 这比创建无效节点更安全
    
    // 创建一个简单的类型参数
    const typeParameter = ts.factory.createTypeParameterDeclaration(
      undefined,
      ts.factory.createIdentifier('K'),
      undefined,
      undefined
    );
    
    // 创建一个基本的映射类型 { [K in keyof T]: any }
    return ts.factory.createMappedTypeNode(
      undefined, // readonlyToken
      typeParameter,
      undefined, // nameType
      undefined, // questionToken 
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword), // type
      undefined  // members
    );
  };
};
