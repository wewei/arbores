/**
 * EndOfFileToken AST Node
 * SyntaxKind: 1
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface EndOfFileTokenNode extends BaseTokenNode {
  kind: 1; // EndOfFileToken
  
  /** EndOfFileToken通常为空字符串 */
  text: '';
}

/**
 * 类型判定函数
 */
export function isEndOfFileToken(node: BaseTokenNode): node is EndOfFileTokenNode {
  return node.kind === 1;
}
