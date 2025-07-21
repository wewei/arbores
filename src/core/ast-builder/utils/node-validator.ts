import * as ts from 'typescript';

/**
 * 递归检查节点树中是否包含 Unknown 类型的节点
 */
export function validateNodeTree(node: ts.Node, path: string = ''): string[] {
  const errors: string[] = [];
  
  // 检查当前节点
  if (node.kind === ts.SyntaxKind.Unknown) {
    errors.push(`❌ Found Unknown node at path: ${path}, node: ${JSON.stringify({
      kind: node.kind,
      text: node.getText ? node.getText() : 'N/A',
      flags: node.flags,
      pos: node.pos,
      end: node.end
    })}`);
  }
  
  // 检查节点是否有无效的属性
  if (!node.kind || node.kind < 0) {
    errors.push(`❌ Found invalid node kind (${node.kind}) at path: ${path}`);
  }
  
  // 特殊检查一些可能出问题的节点类型
  if (node.kind === ts.SyntaxKind.ParenthesizedExpression) {
    const parenExpr = node as ts.ParenthesizedExpression;
    if (!parenExpr.expression || parenExpr.expression.kind === ts.SyntaxKind.Unknown) {
      errors.push(`❌ ParenthesizedExpression has invalid expression at path: ${path}`);
    }
  }
  
  // 递归检查子节点
  let childIndex = 0;
  ts.forEachChild(node, (child: ts.Node) => {
    const childPath = `${path}/${ts.SyntaxKind[node.kind]}[${childIndex}]`;
    const childErrors = validateNodeTree(child, childPath);
    errors.push(...childErrors);
    childIndex++;
  });
  
  return errors;
}

/**
 * 安全地验证节点树并报告问题
 */
export function safeValidateNode(node: ts.Node, context: string): void {
  try {
    const errors = validateNodeTree(node, context);
    if (errors.length > 0) {
      console.error(`🚨 Node validation errors in ${context}:`);
      errors.forEach(error => console.error(error));
      throw new Error(`Node validation failed in ${context}: Found ${errors.length} Unknown nodes`);
    }
    // Node validation passed silently
  } catch (error) {
    console.error(`❌ Error during node validation in ${context}:`, error);
    throw error;
  }
}
