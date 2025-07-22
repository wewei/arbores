/**
 * ThrowStatement AST Node
 * SyntaxKind: 257
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTypedNode } from '../base';

export interface ThrowStatementNode extends BaseTypedNode {
  kind: 257; // ThrowStatement
  
  // TODO: 添加ThrowStatement特定属性
  // 注意：不要使用text, children, properties等通用字段
  // 而是定义具体的强类型属性，如：
  // - value: string (for literals)
  // - name: string (for declarations)  
  // - parameters: ParameterNode[] (for functions)
}

/**
 * 类型判定函数
 */
export function isThrowStatement(node: BaseTypedNode): node is ThrowStatementNode {
  return node.kind === 257;
}
