/**
 * CloseBracketToken AST Node
 * SyntaxKind: 24
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTypedNode } from '../base';

export interface CloseBracketTokenNode extends BaseTypedNode {
  kind: 24; // CloseBracketToken
  
  // TODO: 添加CloseBracketToken特定属性
  // 注意：不要使用text, children, properties等通用字段
  // 而是定义具体的强类型属性，如：
  // - value: string (for literals)
  // - name: string (for declarations)  
  // - parameters: ParameterNode[] (for functions)
}

/**
 * 类型判定函数
 */
export function isCloseBracketToken(node: BaseTypedNode): node is CloseBracketTokenNode {
  return node.kind === 24;
}
