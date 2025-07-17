import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';

// 创建 SourceFile 节点
export function createSourceFileNode(node: ASTNode, ast: SourceFileAST): ts.SourceFile {
  const statements = node.children?.map(childId => {
    const childNode = ast.nodes[childId];
    if (!childNode) return ts.factory.createEmptyStatement();
    // TODO: 这里需要递归调用 createTSNode，暂时返回空语句
    return ts.factory.createEmptyStatement();
  }) || [];
  
  return ts.factory.createSourceFile(
    statements,
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  );
} 