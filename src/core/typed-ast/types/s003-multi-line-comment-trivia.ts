/**
 * MultiLineCommentTrivia AST Node
 * SyntaxKind: 3
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface MultiLineCommentTriviaNode extends BaseTokenNode {
  kind: 3; // MultiLineCommentTrivia
  
  /** 多行注释的完整文本，包括开始和结束标记 */
  text: string;
  
  /** 注释内容（不包含开始和结束标记） */
  content: string;
}

/**
 * 类型判定函数
 */
export function isMultiLineCommentTrivia(node: BaseTokenNode): node is MultiLineCommentTriviaNode {
  return node.kind === 3;
}
