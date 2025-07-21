/**
 * Roundtrip E2E Test Runner
 * 
 * 验证 TypeScript 文件的 parse → stringify → token 比较的往返测试
 */

import { describe, test, expect } from 'bun:test';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import * as ts from 'typescript';

/**
 * 获取文件的前序遍历序列
 */
function getASTPreorderTraversal(filePath: string): string[] {
  const sourceCode = readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
  
  const traversal: string[] = [];
  
  function traverse(node: ts.Node): void {
    // 添加节点类型和文本，但标准化格式化
    const nodeText = node.getText(sourceFile);
    const nodeKind = ts.SyntaxKind[node.kind];
    
    // 标准化文本：统一换行符、缩进、空行和注释
    const normalizedText = nodeText
      .replace(/\r\n/g, '\n')  // 统一换行符
      .replace(/\r/g, '\n')    // 处理单独的 \r
      .replace(/[ ]{2,}/g, ' ') // 将多个空格压缩为单个空格
      .replace(/\n[ ]{2,}/g, '\n ') // 将行首多个空格压缩为单个空格
      .replace(/\n\s*\n\s*\n/g, '\n\n') // 将多个连续空行压缩为两个空行
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
      .replace(/\/\/.*$/gm, '') // 移除单行注释
      .replace(/\n\s*\n/g, '\n') // 将两个空行压缩为一个空行
      .replace(/\s*{\s*/g, '{') // 移除对象字面量的大括号周围的空格
      .replace(/\s*}\s*/g, '}') // 移除对象字面量的大括号周围的空格
      .replace(/\s*\(\s*/g, '(') // 移除括号周围的空格
      .replace(/\s*\)\s*/g, ')') // 移除括号周围的空格
      .replace(/\s*\[\s*/g, '[') // 移除方括号周围的空格
      .replace(/\s*\]\s*/g, ']') // 移除方括号周围的空格
      .replace(/\s*,\s*/g, ',') // 移除逗号周围的空格
      .replace(/\s*;\s*/g, ';') // 移除分号周围的空格
      .replace(/\s*:\s*/g, ':') // 移除冒号周围的空格
      .replace(/\s*=\s*/g, '=') // 移除等号周围的空格
      .replace(/\s*=>\s*/g, '=>') // 移除箭头函数周围的空格
      .replace(/\s*else\s*/g, 'else') // 移除 else 周围的空格
      .replace(/\s*catch\s*/g, 'catch') // 移除 catch 周围的空格
      .replace(/\s*finally\s*/g, 'finally') // 移除 finally 周围的空格
      .trim(); // 移除首尾空白
    
    // 只有当文本不为空时才添加
    if (normalizedText) {
      traversal.push(`${nodeKind}:${normalizedText}`);
    }
    
    // 遍历子节点
    node.forEachChild(traverse);
  }
  
  traverse(sourceFile);
  return traversal;
}

/**
 * 比较两个前序遍历序列
 */
function compareASTTraversals(original: string[], roundtrip: string[]): { match: boolean; firstMismatch?: number; context?: string } {
  const minLength = Math.min(original.length, roundtrip.length);
  
  for (let i = 0; i < minLength; i++) {
    if (original[i] !== roundtrip[i]) {
      const start = Math.max(0, i - 2);
      const end = Math.min(original.length, i + 3);
      const context = {
        position: i,
        original: original.slice(start, end),
        roundtrip: roundtrip.slice(start, end)
      };
      return { match: false, firstMismatch: i, context: JSON.stringify(context, null, 2) };
    }
  }
  
  if (original.length !== roundtrip.length) {
    return { 
      match: false, 
      firstMismatch: minLength,
      context: `Length mismatch: original=${original.length}, roundtrip=${roundtrip.length}`
    };
  }
  
  return { match: true };
}

/**
 * 执行 arbores 命令
 */
function executeArboresCommand(args: string[]): { success: boolean; output: string; error?: string } {
  try {
    const output = execSync(`bun run arbores ${args.join(' ')}`, { 
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    return { success: true, output };
  } catch (error: any) {
    return { 
      success: false, 
      output: error.stdout || '', 
      error: error.stderr || error.message 
    };
  }
}

/**
 * 测试单个文件的 roundtrip
 */
function testRoundtrip(tsFile: string): void {
  const fileName = tsFile.split('/').pop()!.split('\\').pop()!;
  const baseName = fileName.replace('.ts', '');
  
  // 创建临时文件路径
  const tempDir = tmpdir();
  const astFile = join(tempDir, `${baseName}.ast.json`);
  const roundtripFile = join(tempDir, `${baseName}-roundtrip.ts`);
  
  console.log(`Testing roundtrip for ${fileName}...`);
  
  // 步骤1: 解析为 AST
  const parseResult = executeArboresCommand(['parse', tsFile, '--output', astFile]);
  if (!parseResult.success) {
    throw new Error(`Parse failed for ${fileName}: ${parseResult.error}`);
  }
  
  // 步骤2: 从 AST 生成代码
  const stringifyResult = executeArboresCommand(['stringify', astFile, '--format', 'readable', '--output', roundtripFile]);
  if (!stringifyResult.success) {
    throw new Error(`Stringify failed for ${fileName}: ${stringifyResult.error}`);
  }
  
  // 步骤3: 比较 AST 前序遍历
  const originalTraversal = getASTPreorderTraversal(tsFile);
  const roundtripTraversal = getASTPreorderTraversal(roundtripFile);
  
  const comparison = compareASTTraversals(originalTraversal, roundtripTraversal);
  
  if (!comparison.match) {
    console.log(`❌ Roundtrip failed for ${fileName}`);
    console.log(`First mismatch at position ${comparison.firstMismatch}`);
    console.log('Context:', comparison.context);
    throw new Error(`Roundtrip failed for ${fileName}: AST traversal mismatch at position ${comparison.firstMismatch}`);
  }
  
  console.log(`✅ Roundtrip passed for ${fileName}`);
}

/**
 * 发现测试文件
 */
function discoverTestFiles(): string[] {
  const fixturesDir = 'src/cli/__tests__/fixtures';
  const files = [
    'simple.ts',
    'function-test.ts',
    'class-test.ts',
    'generics-test.ts',
    'advanced-features.ts',
    'complex.ts',
    'statements-test.ts',
    'enum-test.ts',
    'export-test.ts',
    'export-simple.ts'
  ];
  
  return files.map(file => `${fixturesDir}/${file}`);
}

describe('Roundtrip Tests', () => {
  const testFiles = discoverTestFiles();
  
  for (const testFile of testFiles) {
    test(`Roundtrip: ${testFile.split('/').pop()}`, () => {
      testRoundtrip(testFile);
    });
  }
}); 