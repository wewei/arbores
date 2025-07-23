/**
 * SingleLineCommentTrivia AST Node
 * SyntaxKind: 2
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface SingleLineCommentTriviaNode extends BaseTokenNode {
  kind: 2; // SingleLineCommentTrivia
  
  /** 单行注释的完整文本，包括 '//' 前缀 */
  text: string;
  
  /** 注释内容（不包含 '//' 前缀） */
  content: string;
}

/**
 * 类型判定函数
 */
export function isSingleLineCommentTrivia(node: BaseTokenNode): node is SingleLineCommentTriviaNode {
  return node.kind === 2;
}
