import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { NodeBuilderFn, CreateNodeFn } from '../types';

export const createExportAssignment: NodeBuilderFn<ts.ExportAssignment> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ExportAssignment => {
    const children = node.children || [];
    
    let isExportEquals = false;
    let expression: ts.Expression | undefined;
    
    // 遍历子节点找到相关部分
    for (const childId of children) {
      const childNode = sourceFile.nodes[childId];
      if (!childNode) continue;
      
      switch (childNode.kind) {
        case ts.SyntaxKind.DefaultKeyword:
          // 这是 export default，不是 export =
          isExportEquals = false;
          break;
        case ts.SyntaxKind.EqualsToken:
          // 这是 export = 语法
          isExportEquals = true;
          break;
        default:
          // 其他节点可能是表达式
          if (!expression && childNode.kind !== ts.SyntaxKind.ExportKeyword) {
            expression = createNode(sourceFile, childNode) as ts.Expression;
          }
          break;
      }
    }
    
    // 如果没有找到表达式，创建一个默认的标识符
    if (!expression) {
      expression = ts.factory.createIdentifier('undefined');
    }
    
    return ts.factory.createExportAssignment(
      undefined, // modifiers
      isExportEquals,
      expression
    );
  };
};
