import * as ts from 'typescript';
import type { SourceFileAST } from './types';
import { createNode } from './ast-builder';

// 从 AST 节点生成 TypeScript 代码
export function stringifyNode(
  nodeId: string, 
  ast: SourceFileAST, 
  format: 'compact' | 'readable' | 'minified' = 'readable'
): string {
  const node = ast.nodes[nodeId];
  if (!node) {
    throw new Error(`Node with ID ${nodeId} not found`);
  }
  
  // 对于有文本的节点直接返回文本
  if (node.text) {
    return node.text;
  }
  
  // 对于复杂节点，尝试使用 TypeScript Factory API 重建
  try {
    const tsNode = createNode(ast, node);
    
    // 使用 TypeScript Printer API 生成代码
    const printer = ts.createPrinter({
      newLine: format === 'minified' ? ts.NewLineKind.CarriageReturnLineFeed : ts.NewLineKind.LineFeed,
      removeComments: format === 'minified',
      omitTrailingSemicolon: format === 'minified'
    });
    
    // 创建临时的 SourceFile 用于打印
    const tempSourceFile = ts.createSourceFile(
      'temp.ts',
      '',
      ts.ScriptTarget.Latest,
      true
    );
    
    return printer.printNode(
      ts.EmitHint.Unspecified,
      tsNode,
      tempSourceFile
    );
  } catch (error) {
    // 如果 Factory API 失败，返回节点信息
    return `/* ${ts.SyntaxKind[node.kind]} node */`;
  }
}
