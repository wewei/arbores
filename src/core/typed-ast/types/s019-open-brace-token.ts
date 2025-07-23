/**
 * OpenBraceToken AST Node
 * SyntaxKind: 19
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface OpenBraceTokenNode extends BaseTokenNode {
  kind: 19; // OpenBraceToken
  
  /** 左花括号的文本，固定为 '{' */
  text: '{';
}

/**
 * 类型判定函数
 */
export function isOpenBraceToken(node: BaseTokenNode): node is OpenBraceTokenNode {
  return node.kind === 19;
}
