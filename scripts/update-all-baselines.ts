#!/usr/bin/env bun

/**
 * 批量更新 E2E baseline 文件
 * 重新生成所有 AST fixture 文件，然后更新所有 baseline 输出
 */

import { readdir, stat, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { spawn } from 'bun';
import * as yaml from 'js-yaml';

const CLI_PATH = './src/cli/index.ts';
const FIXTURES_PATH = './src/cli/__tests__/fixtures';
const BASELINES_PATH = './src/cli/__tests__/e2e/baselines';

// 需要重新生成 AST 的 TypeScript 源文件
const TS_SOURCE_FILES = [
  'simple.ts',
  'class-test.ts',
  'function-test.ts',
  'advanced-features.ts',
  'complex.ts',
  'enum-test.ts',
  'export-test.ts',
  'export-simple.ts',
  'generics-test.ts',
  'statements-test.ts',
  'template-literal-test.ts'
];

interface BaselineMetadata {
  description: string;
  command: string[];
  exitCode: number;
  environment: Record<string, string>;
  created: string;
  updated: string;
}

/**
 * 执行命令并返回结果
 */
async function executeCommand(
  command: string[],
  environment: Record<string, string> = {}
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  try {
    const proc = spawn({
      cmd: ['bun', CLI_PATH, ...command],
      env: { ...process.env, ...environment },
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    const exitCode = await proc.exited;
    return { exitCode, stdout, stderr };
  } catch (error) {
    console.error('执行命令失败:', error);
    return { exitCode: 1, stdout: '', stderr: String(error) };
  }
}

/**
 * 重新生成 AST fixture 文件
 */
async function regenerateASTFixtures() {
  console.log('🔄 重新生成 AST fixture 文件...');
  
  for (const tsFile of TS_SOURCE_FILES) {
    const tsPath = join(FIXTURES_PATH, tsFile);
    const astPath = join(FIXTURES_PATH, tsFile.replace('.ts', '.ast.json'));
    
    if (!existsSync(tsPath)) {
      console.log(`⚠️  跳过不存在的文件: ${tsFile}`);
      continue;
    }
    
    console.log(`  📝 生成 ${tsFile} -> ${tsFile.replace('.ts', '.ast.json')}`);
    
    const result = await executeCommand(['parse', tsPath, '--format', 'json']);
    
    if (result.exitCode !== 0) {
      console.error(`❌ 生成 ${tsFile} 的 AST 失败:`, result.stderr);
      continue;
    }
    
    await writeFile(astPath, result.stdout);
  }
}

/**
 * 获取所有 baseline 目录
 */
async function getAllBaselineDirs(): Promise<string[]> {
  const dirs: string[] = [];
  
  async function scanDir(dirPath: string) {
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        // 检查是否包含 metadata.yaml
        if (existsSync(join(fullPath, 'metadata.yaml'))) {
          dirs.push(fullPath);
        } else {
          // 递归扫描子目录
          await scanDir(fullPath);
        }
      }
    }
  }
  
  await scanDir(BASELINES_PATH);
  return dirs;
}

/**
 * 更新单个 baseline
 */
async function updateBaseline(baselineDir: string) {
  const metadataPath = join(baselineDir, 'metadata.yaml');
  const stdoutPath = join(baselineDir, 'stdout.txt');
  const stderrPath = join(baselineDir, 'stderr.txt');
  
  try {
    // 读取 metadata
    const metadataContent = await Bun.file(metadataPath).text();
    const metadata = yaml.load(metadataContent) as BaselineMetadata;
    
    console.log(`  🔧 更新: ${metadata.description}`);
    
    // 执行命令
    const result = await executeCommand(metadata.command, metadata.environment);
    
    // 更新输出文件
    if (result.stdout) {
      await writeFile(stdoutPath, result.stdout);
    }
    
    if (result.stderr) {
      await writeFile(stderrPath, result.stderr);
    }
    
    // 更新 metadata 中的时间戳
    metadata.updated = new Date().toISOString();
    metadata.exitCode = result.exitCode;
    
    const updatedYaml = yaml.dump(metadata, { 
      lineWidth: -1,
      noRefs: true 
    });
    
    await writeFile(metadataPath, updatedYaml);
    
    console.log(`    ✅ 成功 (退出代码: ${result.exitCode})`);
    
  } catch (error) {
    console.error(`    ❌ 更新失败:`, error);
  }
}

/**
 * 批量更新所有 baselines
 */
async function updateAllBaselines() {
  console.log('🔄 更新所有 baseline 文件...');
  
  const baselineDirs = await getAllBaselineDirs();
  console.log(`找到 ${baselineDirs.length} 个 baseline 测试`);
  
  for (const dir of baselineDirs) {
    await updateBaseline(dir);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始批量更新 E2E baseline 测试...\n');
  
  try {
    // 1. 重新生成 AST fixture 文件
    await regenerateASTFixtures();
    
    console.log('\n');
    
    // 2. 更新所有 baseline 文件
    await updateAllBaselines();
    
    console.log('\n✅ 批量更新完成！');
    
  } catch (error) {
    console.error('❌ 批量更新失败:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
