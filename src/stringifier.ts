import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from './types';

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
  
  // 简化版本：直接返回节点的文本或生成基本代码
  if (node.text) {
    return node.text;
  }
  
  // 对于复杂节点，生成基本的结构
  switch (node.kind) {
    case ts.SyntaxKind.SourceFile:
      return generateSourceFileText(node, ast, format);
    case ts.SyntaxKind.FunctionDeclaration:
      return generateFunctionText(node, ast, format);
    case ts.SyntaxKind.VariableStatement:
      return generateVariableText(node, ast, format);
    case ts.SyntaxKind.ClassDeclaration:
      return generateClassText(node, ast, format);
    case ts.SyntaxKind.InterfaceDeclaration:
      return generateInterfaceText(node, ast, format);
    case ts.SyntaxKind.Block:
      return generateBlockText(node, ast, format);
    case ts.SyntaxKind.ReturnStatement:
      return generateReturnText(node, ast, format);
    case ts.SyntaxKind.IfStatement:
      return generateIfText(node, ast, format);
    default:
      return `/* ${ts.SyntaxKind[node.kind]} node */`;
  }
}

// 生成 SourceFile 文本
function generateSourceFileText(node: ASTNode, ast: SourceFileAST, format: 'compact' | 'readable' | 'minified'): string {
  const statements = node.children?.map(childId => {
    const childNode = ast.nodes[childId];
    return stringifyNode(childId, ast, format);
  }).join(format === 'minified' ? '' : '\n') || '';
  
  return statements;
}

// 生成函数文本
function generateFunctionText(node: ASTNode, ast: SourceFileAST, format: 'compact' | 'readable' | 'minified'): string {
  const children = node.children || [];
  const name = node.properties?.name || 'anonymous';
  const params = children[1] ? stringifyNode(children[1], ast, format) : '';
  const body = children[2] ? stringifyNode(children[2], ast, format) : '{}';
  
  const prefix = node.properties?.isAsync ? 'async ' : '';
  const separator = format === 'minified' ? '' : '\n';
  
  return `${prefix}function ${name}(${params}) ${body}`;
}

// 生成变量文本
function generateVariableText(node: ASTNode, ast: SourceFileAST, format: 'compact' | 'readable' | 'minified'): string {
  const children = node.children || [];
  const declaration = children[0] ? stringifyNode(children[0], ast, format) : '';
  return `var ${declaration};`;
}

// 生成类文本
function generateClassText(node: ASTNode, ast: SourceFileAST, format: 'compact' | 'readable' | 'minified'): string {
  const children = node.children || [];
  const name = node.properties?.name || 'AnonymousClass';
  return `class ${name} {}`;
}

// 生成接口文本
function generateInterfaceText(node: ASTNode, ast: SourceFileAST, format: 'compact' | 'readable' | 'minified'): string {
  const children = node.children || [];
  const name = node.properties?.name || 'AnonymousInterface';
  return `interface ${name} {}`;
}

// 生成块文本
function generateBlockText(node: ASTNode, ast: SourceFileAST, format: 'compact' | 'readable' | 'minified'): string {
  const statements = node.children?.map(childId => {
    const childNode = ast.nodes[childId];
    return stringifyNode(childId, ast, format);
  }).join(format === 'minified' ? '' : '\n  ') || '';
  
  const separator = format === 'minified' ? '' : '\n';
  return `{${separator}${statements}${separator}}`;
}

// 生成返回语句文本
function generateReturnText(node: ASTNode, ast: SourceFileAST, format: 'compact' | 'readable' | 'minified'): string {
  const children = node.children || [];
  const expression = children[0] ? stringifyNode(children[0], ast, format) : '';
  return `return ${expression};`;
}

// 生成 if 语句文本
function generateIfText(node: ASTNode, ast: SourceFileAST, format: 'compact' | 'readable' | 'minified'): string {
  const children = node.children || [];
  const condition = children[0] ? stringifyNode(children[0], ast, format) : '';
  const thenBlock = children[1] ? stringifyNode(children[1], ast, format) : '{}';
  const elseBlock = children[2] ? ` else ${stringifyNode(children[2], ast, format)}` : '';
  
  const separator = format === 'minified' ? '' : '\n';
  return `if (${condition}) ${thenBlock}${elseBlock}`;
} 