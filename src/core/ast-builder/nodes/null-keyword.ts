import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn } from '../types';

/**
 * 创建 null 关键字节点
 */
export function createNullKeyword(createNode: CreateNodeFn) {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.NullLiteral => {
    return ts.factory.createNull();
  };
}
