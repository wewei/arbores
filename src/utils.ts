import * as ts from 'typescript';
import * as crypto from 'crypto';

// 生成节点 ID
export function generateNodeId(node: ts.Node): string {
  const content = {
    kind: node.kind,
    text: node.getText(),
    children: node.getChildren().map(child => generateNodeId(child))
  };
  
  return crypto.createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex')
    .substring(0, 16);
}

// 生成版本 ID
export function generateVersionId(sourceFile: ts.SourceFile): string {
  return crypto.createHash('sha256')
    .update(sourceFile.getFullText())
    .digest('hex')
    .substring(0, 8);
}

// 判断是否为 token 节点
export function isTokenNode(kind: number): boolean {
  return kind >= ts.SyntaxKind.FirstToken && kind <= ts.SyntaxKind.LastToken;
}

// 提取节点属性
export function extractNodeProperties(node: ts.Node): Record<string, any> | undefined {
  const properties: Record<string, any> = {};
  
  if (ts.isFunctionDeclaration(node)) {
    properties.name = node.name?.getText();
    properties.parameters = node.parameters.length;
    properties.isAsync = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword);
  } else if (ts.isVariableDeclaration(node)) {
    properties.name = node.name.getText();
    properties.hasInitializer = !!node.initializer;
  } else if (ts.isClassDeclaration(node)) {
    properties.name = node.name?.getText();
    properties.hasExtends = !!node.heritageClauses;
  } else if (ts.isInterfaceDeclaration(node)) {
    properties.name = node.name.getText();
    properties.hasExtends = !!node.heritageClauses;
  }
  
  return Object.keys(properties).length > 0 ? properties : undefined;
}

// 读取文件内容
export async function readFile(filePath: string): Promise<string> {
  const fs = await import('fs/promises');
  return fs.readFile(filePath, 'utf-8');
}

// 写入文件
export async function writeFile(filePath: string, content: string): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  // 确保目录存在
  const dir = path.dirname(filePath);
  // 只有当目录不是当前目录时才创建
  if (dir !== '.' && dir !== '') {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(filePath, content);
}

// 检查文件是否存在
export async function fileExists(filePath: string): Promise<boolean> {
  const fs = await import('fs/promises');
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
} 