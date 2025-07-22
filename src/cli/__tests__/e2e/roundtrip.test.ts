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
// 移除未使用的导入

/**
 * AST 节点比较结果
 */
type ASTComparisonResult = {
  match: boolean;
  differences?: Array<{
    path: string;
    original: string;
    roundtrip: string;
    reason: string;
  }>;
};

/**
 * 获取节点的代码文本
 */
function getNodeText(node: ts.Node, sourceFile: ts.SourceFile): string {
  return node.getText(sourceFile);
}

/**
 * 递归比较两个 AST 节点
 */
function compareASTNodes(
  original: ts.Node, 
  roundtrip: ts.Node, 
  originalSourceFile: ts.SourceFile,
  roundtripSourceFile: ts.SourceFile,
  path: string = 'root'
): ASTComparisonResult {
  const differences: Array<{
    path: string;
    original: string;
    roundtrip: string;
    reason: string;
  }> = [];

  // 比较节点类型
  if (original.kind !== roundtrip.kind) {
    differences.push({
      path,
      original: `${ts.SyntaxKind[original.kind]}: ${getNodeText(original, originalSourceFile)}`,
      roundtrip: `${ts.SyntaxKind[roundtrip.kind]}: ${getNodeText(roundtrip, roundtripSourceFile)}`,
      reason: 'Node kind mismatch'
    });
    return { match: false, differences };
  }

  // 比较子节点数量
  const originalChildren = original.getChildren();
  const roundtripChildren = roundtrip.getChildren();
  
  if (originalChildren.length !== roundtripChildren.length) {
    differences.push({
      path,
      original: `${originalChildren.length} children: ${getNodeText(original, originalSourceFile)}`,
      roundtrip: `${roundtripChildren.length} children: ${getNodeText(roundtrip, roundtripSourceFile)}`,
      reason: 'Child count mismatch'
    });
    return { match: false, differences };
  }

  // 递归比较子节点
  for (let i = 0; i < originalChildren.length; i++) {
    const originalChild = originalChildren[i];
    const roundtripChild = roundtripChildren[i];
    
    // 检查子节点是否存在
    if (!originalChild || !roundtripChild) {
      differences.push({
        path: `${path}.children[${i}]`,
        original: originalChild ? getNodeText(originalChild, originalSourceFile) : 'undefined',
        roundtrip: roundtripChild ? getNodeText(roundtripChild, roundtripSourceFile) : 'undefined',
        reason: 'Child node missing'
      });
      continue;
    }
    
    // 跳过注释节点
    if (originalChild.kind === ts.SyntaxKind.JSDocComment || roundtripChild.kind === ts.SyntaxKind.JSDocComment) {
      continue;
    }
    
    const childPath = `${path}.children[${i}]`;
    const childResult = compareASTNodes(originalChild, roundtripChild, originalSourceFile, roundtripSourceFile, childPath);
    
    if (!childResult.match) {
      differences.push(...(childResult.differences || []));
    }
  }

  // 对于某些特殊节点，比较关键属性
  if (ts.isIdentifier(original) && ts.isIdentifier(roundtrip)) {
    if (original.text !== roundtrip.text) {
      differences.push({
        path: `${path}.text`,
        original: original.text,
        roundtrip: roundtrip.text,
        reason: 'Identifier text mismatch'
      });
    }
  } else if (ts.isStringLiteral(original) && ts.isStringLiteral(roundtrip)) {
    if (original.text !== roundtrip.text) {
      differences.push({
        path: `${path}.text`,
        original: original.text,
        roundtrip: roundtrip.text,
        reason: 'String literal text mismatch'
      });
    }
  } else if (ts.isNumericLiteral(original) && ts.isNumericLiteral(roundtrip)) {
    if (original.text !== roundtrip.text) {
      differences.push({
        path: `${path}.text`,
        original: original.text,
        roundtrip: roundtrip.text,
        reason: 'Numeric literal text mismatch'
      });
    }
  }

  return {
    match: differences.length === 0,
    differences: differences.length > 0 ? differences : undefined
  };
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
  
  // 步骤3: 比较 AST 结构
  const originalSourceCode = readFileSync(tsFile, 'utf-8');
  const roundtripSourceCode = readFileSync(roundtripFile, 'utf-8');
  
  const originalSourceFile = ts.createSourceFile(tsFile, originalSourceCode, ts.ScriptTarget.Latest, true);
  const roundtripSourceFile = ts.createSourceFile(roundtripFile, roundtripSourceCode, ts.ScriptTarget.Latest, true);
  
  const comparison = compareASTNodes(originalSourceFile, roundtripSourceFile, originalSourceFile, roundtripSourceFile);
  
  if (!comparison.match) {
    console.log(`❌ Roundtrip failed for ${fileName}`);
    console.log('AST differences:');
    comparison.differences?.forEach(diff => {
      console.log(`  ${diff.path}: ${diff.reason}`);
      console.log(`    Original: ${diff.original}`);
      console.log(`    Roundtrip: ${diff.roundtrip}`);
    });
    throw new Error(`Roundtrip failed for ${fileName}: AST structure mismatch`);
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