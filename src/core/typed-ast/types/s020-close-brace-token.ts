/**
 * CloseBraceToken AST Node
 * SyntaxKind: 20
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface CloseBraceTokenNode extends BaseTokenNode {
  kind: 20; // CloseBraceToken
  
  /** 右花括号的文本，固定为 '}' */
  text: '}';
}

/**
 * 类型判定函数
 */
export function isCloseBraceToken(node: BaseTokenNode): node is CloseBraceTokenNode {
  return node.kind === 20;
}
