/**
 * Roundtrip Test Utilities
 * 
 * 提供 roundtrip 测试的公共函数和工具
 */

import { execSync } from 'child_process';
import { readFileSync, unlinkSync, readdirSync, statSync } from 'fs';
import { tmpdir } from 'os';
import { join, relative, extname } from 'path';
import type { SourceFileAST } from '../../../core/types';
import { 
  compareSourceFileASTsIntelligent,
  formatASTLocation,
} from '../../../core/utils/ast-comparison';
import { getSyntaxKindName } from '../../../core/syntax-kind-names';
import { stringifyNode } from '../../../core/stringify';

// ===== 基础工具函数 =====

/**
 * 执行 arbores 命令
 */
export function executeArboresCommand(args: string[]): { success: boolean; output: string; error?: string } {
  try {
    const output = execSync(`bun run arbores ${args.join(' ')}`, { 
      encoding: 'utf-8',
      cwd: process.cwd(),
      stdio: 'pipe'
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
 * 生成唯一的临时文件名
 */
export function generateTempFileName(baseName: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return join(tmpdir(), `arbores-${baseName}-${timestamp}-${random}.${extension}`);
}

// ===== 文件发现和分类 =====

/**
 * 递归扫描目录下的所有 TypeScript 文件
 */
export function findAllTSFiles(directory: string, excludePatterns: string[] = []): string[] {
  const files: string[] = [];
  
  function scanDirectory(dir: string) {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 跳过某些目录
        if (excludePatterns.some(pattern => fullPath.includes(pattern))) {
          continue;
        }
        scanDirectory(fullPath);
      } else if (stat.isFile() && extname(entry) === '.ts') {
        // 跳过某些文件
        if (excludePatterns.some(pattern => fullPath.includes(pattern))) {
          continue;
        }
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(directory);
  return files.sort();
}

/**
 * 文件分类器
 */
export interface FileCategories {
  simple: string[];
  medium: string[];  
  complex: string[];
  problematic: string[];
}

/**
 * 根据文件名和路径对文件进行分类
 */
export function categorizeFiles(files: string[]): FileCategories {
  const categories: FileCategories = {
    simple: [],
    medium: [],
    complex: [],
    problematic: []
  };
  
  for (const file of files) {
    const fileName = file.split(/[/\\]/).pop()!;
    const relativePath = relative(process.cwd(), file);
    
    // 已知有问题的文件 (先跳过，逐步修复)
    if (
      fileName.includes('complex.ts') ||  // 已知JSDoc问题
      relativePath.includes('node_modules') ||
      relativePath.includes('.git') ||
      relativePath.includes('dist') ||
      relativePath.includes('build')
    ) {
      categories.problematic.push(file);
    }
    // 简单文件 (测试文件、工具函数等)
    else if (
      relativePath.includes('__tests__') ||
      relativePath.includes('fixtures') ||
      fileName.includes('utils') ||
      fileName.includes('types') ||
      fileName.includes('index') ||
      fileName.length < 20
    ) {
      categories.simple.push(file);
    }
    // 复杂文件 (AST builders, 核心逻辑等)
    else if (
      relativePath.includes('ast-builder') ||
      relativePath.includes('nodes/') ||
      fileName.includes('parser') ||
      fileName.includes('stringify') ||
      fileName.includes('query')
    ) {
      categories.complex.push(file);
    }
    // 中等复杂度文件
    else {
      categories.medium.push(file);
    }
  }
  
  return categories;
}

// ===== 测试结果统计 =====

/**
 * 测试结果统计
 */
export interface TestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  failures: Array<{ file: string; error: string }>;
}

/**
 * 打印测试结果统计
 */
export function printTestStats(stats: TestStats, title: string) {
  console.log(`\n=== ${title} ===`);
  console.log(`Total:   ${stats.total}`);
  console.log(`Passed:  ${stats.passed} (${((stats.passed / stats.total) * 100).toFixed(1)}%)`);
  console.log(`Failed:  ${stats.failed} (${((stats.failed / stats.total) * 100).toFixed(1)}%)`);
  if (stats.skipped > 0) {
    console.log(`Skipped: ${stats.skipped} (${((stats.skipped / stats.total) * 100).toFixed(1)}%)`);
  }
  
  if (stats.failures.length > 0) {
    console.log(`\n❌ Failures:`);
    for (const failure of stats.failures.slice(0, 5)) { // 只显示前5个失败
      console.log(`  - ${failure.file}`);
      console.log(`    ${failure.error.split('\n')[0]}`);
    }
    
    if (stats.failures.length > 5) {
      console.log(`  ... and ${stats.failures.length - 5} more failures`);
    }
  }
}

// ===== 核心 Roundtrip 测试函数 =====

/**
 * 测试单个文件的 roundtrip 选项
 */
export interface RoundtripTestOptions {
  verbose?: boolean;
  keepTempFiles?: boolean;
}

/**
 * 测试单个文件的 roundtrip
 */
export function testSingleRoundtrip(tsFile: string, options: RoundtripTestOptions = {}): void {
  const { verbose = true, keepTempFiles = false } = options;
  
  const fileName = tsFile.split(/[/\\]/).pop()!;
  const baseName = fileName.replace('.ts', '');
  
  // 生成临时文件路径
  const originalAstFile = generateTempFileName(`${baseName}-original`, 'ast.json');
  const roundtripCodeFile = generateTempFileName(`${baseName}-roundtrip`, 'ts');
  const roundtripAstFile = generateTempFileName(`${baseName}-roundtrip`, 'ast.json');
  
  if (verbose) {
    console.log(`Testing roundtrip for ${fileName}...`);
  }
  
  let tempFiles: string[] = [];
  
  try {
    // 步骤1: 从原始文件生成原始 AST JSON
    if (verbose) {
      console.log(`  Step 1: Parsing original file ${fileName}`);
    }
    const parseResult = executeArboresCommand(['parse', tsFile, '--output', originalAstFile]);
    if (!parseResult.success) {
      throw new Error(`Step 1 failed - Parse original file: ${parseResult.error}`);
    }
    tempFiles.push(originalAstFile);
    
    // 步骤2: 从原始 AST JSON 生成 roundtrip 代码
    if (verbose) {
      console.log(`  Step 2: Generating roundtrip code`);
    }
    const stringifyResult = executeArboresCommand(['stringify', originalAstFile, '--format', 'readable', '--output', roundtripCodeFile]);
    if (!stringifyResult.success) {
      throw new Error(`Step 2 failed - Generate roundtrip code: ${stringifyResult.error}`);
    }
    tempFiles.push(roundtripCodeFile);
    
    // 步骤3: 从 roundtrip 代码生成 roundtrip AST JSON
    if (verbose) {
      console.log(`  Step 3: Parsing roundtrip code`);
    }
    const roundtripParseResult = executeArboresCommand(['parse', roundtripCodeFile, '--output', roundtripAstFile]);
    if (!roundtripParseResult.success) {
      throw new Error(`Step 3 failed - Parse roundtrip code: ${roundtripParseResult.error}`);
    }
    tempFiles.push(roundtripAstFile);
    
    // 步骤4: 前序遍历比较原始 AST 和 roundtrip AST (智能模式，忽略可选标点符号)
    if (verbose) {
      console.log(`  Step 4: Comparing ASTs (intelligent mode - ignoring optional punctuation)`);
    }
    const originalAST = JSON.parse(readFileSync(originalAstFile, 'utf-8')) as SourceFileAST;
    const roundtripAST = JSON.parse(readFileSync(roundtripAstFile, 'utf-8')) as SourceFileAST;
    
    const comparison = compareSourceFileASTsIntelligent(originalAST, roundtripAST);
    
    if (!comparison.same) {
      // 如果有差异，报测试错误并打印详细差异信息
      const { left: leftPath, right: rightPath } = comparison.diverge;
      
      if (verbose) {
        console.log(`❌ Roundtrip failed for ${fileName}`);
        console.log(`\n=== AST Difference Details ===`);
        console.log(`Left path:  ${formatASTLocation(leftPath, originalAST.nodes)}`);
        console.log(`Right path: ${formatASTLocation(rightPath, roundtripAST.nodes)}`);
        
        // 获取差异节点的详细信息
        if (leftPath.length > 0 && rightPath.length > 0) {
          const leftNodeId = leftPath[leftPath.length - 1]!;
          const rightNodeId = rightPath[rightPath.length - 1]!;
          const leftNode = originalAST.nodes[leftNodeId];
          const rightNode = roundtripAST.nodes[rightNodeId];
          
          if (leftNode && rightNode) {
            console.log(`\n=== Node Details ===`);
            console.log(`Original node:`);
            console.log(`  Kind: ${leftNode.kind} (${getSyntaxKindName(leftNode.kind)})`);
            console.log(`  Text: ${JSON.stringify(leftNode.text)}`);
            console.log(`  Children: ${leftNode.children?.length || 0}`);
            
            console.log(`Roundtrip node:`);
            console.log(`  Kind: ${rightNode.kind} (${getSyntaxKindName(rightNode.kind)})`);
            console.log(`  Text: ${JSON.stringify(rightNode.text)}`);
            console.log(`  Children: ${rightNode.children?.length || 0}`);
            
            // 尝试stringify差异节点来显示具体代码差异
            console.log(`\n=== Diverged Node Code Comparison ===`);
            
            try {
              // Stringify原始节点
              const originalResult = stringifyNode(leftNodeId, originalAST, { format: 'readable' });
              if (originalResult.success) {
                console.log(`Original node code:`);
                console.log(`---`);
                console.log(originalResult.data.code);
                console.log(`---`);
              } else {
                console.log(`Failed to stringify original node: ${originalResult.error.message}`);
              }
            } catch (error) {
              console.log(`Error stringifying original node: ${error}`);
            }
            
            try {
              // Stringify roundtrip节点
              const roundtripResult = stringifyNode(rightNodeId, roundtripAST, { format: 'readable' });
              if (roundtripResult.success) {
                console.log(`Roundtrip node code:`);
                console.log(`---`);
                console.log(roundtripResult.data.code);
                console.log(`---`);
              } else {
                console.log(`Failed to stringify roundtrip node: ${roundtripResult.error.message}`);
              }
            } catch (error) {
              console.log(`Error stringifying roundtrip node: ${error}`);
            }
          }
        }
        
        // 保留临时文件用于调试
        console.log(`\n=== Debug Files ===`);
        console.log(`Original AST:    ${originalAstFile}`);
        console.log(`Roundtrip code:  ${roundtripCodeFile}`);
        console.log(`Roundtrip AST:   ${roundtripAstFile}`);
      }
      
      throw new Error(`Roundtrip failed for ${fileName}: AST structure diverged at first difference`);
    }
    
    if (verbose) {
      console.log(`✅ Roundtrip passed for ${fileName}`);
    }
    
  } finally {
    // 清理临时文件（除非要求保留）
    if (!keepTempFiles && tempFiles.length > 0) {
      if (verbose) {
        console.log(`  Cleaning up ${tempFiles.length} temporary files`);
      }
      for (const file of tempFiles) {
        try {
          unlinkSync(file);
        } catch (e) {
          // 忽略清理错误
        }
      }
    }
  }
}

/**
 * 批量测试选项
 */
export interface BatchRoundtripTestOptions {
  continueOnError?: boolean;
  verbose?: boolean;
  maxFailures?: number;
  keepTempFilesOnError?: boolean;
}

/**
 * 批量运行 roundtrip 测试
 */
export function runBatchRoundtripTests(
  files: string[], 
  options: BatchRoundtripTestOptions = {}
): TestStats {
  const {
    continueOnError = true,
    verbose = true,
    maxFailures = 10,
    keepTempFilesOnError = false
  } = options;
  
  const stats: TestStats = {
    total: files.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    failures: []
  };
  
  if (verbose) {
    console.log(`\n🚀 Starting batch roundtrip tests for ${files.length} files...`);
  }
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const relativePath = relative(process.cwd(), file);
    
    // 如果失败太多，提前停止
    if (stats.failures.length >= maxFailures) {
      const remaining = files.length - i;
      stats.skipped = remaining;
      if (verbose) {
        console.log(`\n⚠️  Stopping early: too many failures (${stats.failures.length}). Skipped ${remaining} remaining files.`);
      }
      break;
    }
    
    try {
      if (verbose) {
        console.log(`\n[${i + 1}/${files.length}] Testing: ${relativePath}`);
      }
      
      testSingleRoundtrip(file, { 
        verbose: false,  // 减少单个测试的详细输出
        keepTempFiles: keepTempFilesOnError
      });
      stats.passed++;
      
      if (verbose) {
        console.log(`  ✅ PASS`);
      }
      
    } catch (error: any) {
      stats.failed++;
      const errorMessage = error.message || String(error);
      stats.failures.push({ file: relativePath, error: errorMessage });
      
      if (verbose) {
        console.log(`  ❌ FAIL: ${errorMessage.split('\n')[0]}`);
      }
      
      if (!continueOnError) {
        throw error;
      }
    }
  }
  
  return stats;
}
