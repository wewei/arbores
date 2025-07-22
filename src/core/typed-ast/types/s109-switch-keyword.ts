/**
 * SwitchKeyword AST Node
 * SyntaxKind: 109
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTypedNode } from '../base';

export interface SwitchKeywordNode extends BaseTypedNode {
  kind: 109; // SwitchKeyword
  
  // TODO: 添加SwitchKeyword特定属性
  // 注意：不要使用text, children, properties等通用字段
  // 而是定义具体的强类型属性，如：
  // - value: string (for literals)
  // - name: string (for declarations)  
  // - parameters: ParameterNode[] (for functions)
}

/**
 * 类型判定函数
 */
export function isSwitchKeyword(node: BaseTypedNode): node is SwitchKeywordNode {
  return node.kind === 109;
}
