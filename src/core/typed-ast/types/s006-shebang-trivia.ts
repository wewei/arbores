/**
 * ShebangTrivia AST Node
 * SyntaxKind: 6
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface ShebangTriviaNode extends BaseTokenNode {
  kind: 6; // ShebangTrivia
  
  /** Shebang的完整文本，包括 '#!' 前缀 */
  text: string;
  
  /** Shebang指定的命令路径 */
  command: string;
}

/**
 * 类型判定函数
 */
export function isShebangTrivia(node: BaseTokenNode): node is ShebangTriviaNode {
  return node.kind === 6;
}
