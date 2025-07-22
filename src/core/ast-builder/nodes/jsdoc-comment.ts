import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn } from '../types';

/**
 * 创建 JSDoc 节点
 */
export function createJSDocComment(createNode: CreateNodeFn) {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.JSDoc => {
    // JSDoc 节点通常有文本内容
    const text = node.text || '';
    
    // 创建 JSDoc 注释，第一个参数是 comment，第二个是 tags
    // 对于简单的情况，我们只传递文本作为注释内容
    return ts.factory.createJSDocComment(text, undefined);
  };
}
