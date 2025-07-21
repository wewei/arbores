#!/usr/bin/env bun
/**
 * 批量生成 YAML 相关 e2e 测试的基线文件
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const baselinesDir = 'src/cli/__tests__/e2e/baselines';

// 寻找所有包含 "yaml-" 前缀的测试目录
function findYamlTestCases(): Array<{ dir: string; metadata: any }> {
  const testCases: Array<{ dir: string; metadata: any }> = [];
  
  const commands = fs.readdirSync(baselinesDir);
  for (const command of commands) {
    const commandDir = path.join(baselinesDir, command);
    if (!fs.statSync(commandDir).isDirectory()) continue;
    
    const testDirs = fs.readdirSync(commandDir);
    for (const testDir of testDirs) {
      if (!testDir.startsWith('yaml-')) continue;
      
      const testPath = path.join(commandDir, testDir);
      const metadataPath = path.join(testPath, 'metadata.yaml');
      
      if (fs.existsSync(metadataPath)) {
        const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
        const metadata = yaml.load(metadataContent) as any;
        testCases.push({ dir: testPath, metadata });
      }
    }
  }
  
  return testCases;
}

console.log('🔍 正在查找 YAML 相关的测试用例...\n');

const yamlTestCases = findYamlTestCases();
console.log(`📋 找到 ${yamlTestCases.length} 个 YAML 测试用例\n`);

for (const testCase of yamlTestCases) {
  const { dir: testDir, metadata } = testCase;
  const testName = path.basename(testDir);
  const commandName = path.basename(path.dirname(testDir));
  
  console.log(`🔄 正在生成基线: ${commandName}/${testName}`);
  
  try {
    // 构建命令
    const command = metadata.command.join(' ');
    const baselineCommand = [
      'bun', 'scripts/generate-e2e-baseline.ts',
      '--command', `"${command}"`,
      '--width', '80',
      '--timestamp', '2025-01-01T00:00:00.000Z',
      '--output', testDir,
      '--update'
    ].join(' ');
    
    console.log(`   📝 执行: ${command}`);
    
    // 设置环境变量并执行
    const env = {
      ...process.env,
      MOCK_TIMESTAMP: '2025-01-01T00:00:00.000Z',
      COLUMNS: '80'
    };
    
    execSync(baselineCommand, { 
      stdio: 'inherit', 
      env,
      cwd: process.cwd()
    });
    
    console.log(`   ✅ 完成: ${commandName}/${testName}\n`);
    
  } catch (error) {
    console.log(`   ❌ 失败: ${commandName}/${testName}`);
    console.log(`   错误: ${error}\n`);
  }
}

console.log('✨ 批量基线生成完成！');
console.log('🧪 现在可以运行 e2e 测试验证 YAML 支持：');
console.log('   bun test src/cli/__tests__/e2e/');
