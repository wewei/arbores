#!/usr/bin/env bun
/**
 * 为 parse 命令添加 markdown 格式拒绝测试
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const baselineDir = 'src/cli/__tests__/e2e/baselines/parse';
const testDir = path.join(baselineDir, 'markdown-format-rejected');

// 测试用例：parse 应该拒绝 markdown 格式
const testCase = {
  description: 'Parse command should reject markdown format (error case)',
  command: ['parse', 'src\\cli\\__tests__\\fixtures\\simple.ts', '--format', 'markdown'],
  exitCode: 1, // 应该返回错误
  environment: {},
  created: new Date().toISOString(),
  updated: new Date().toISOString()
};

console.log('🔄 正在创建 parse markdown 格式拒绝测试用例...\n');

// 创建测试目录
fs.mkdirSync(testDir, { recursive: true });

// 创建 metadata.yaml
const metadataPath = path.join(testDir, 'metadata.yaml');
fs.writeFileSync(metadataPath, yaml.dump(testCase, { indent: 2 }), 'utf-8');

console.log(`✅ 已创建测试用例: parse/markdown-format-rejected`);
console.log('💡 现在生成测试基线...\n');

// 生成基线
const { execSync } = require('child_process');

try {
  const command = testCase.command.join(' ');
  const baselineCommand = `bun scripts/generate-e2e-baseline.ts --command "${command}" --width 80 --timestamp "2025-01-01T00:00:00.000Z" --output "${testDir}" --update`;
  
  console.log(`📝 执行: ${command}`);
  
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
  
  console.log(`✅ 完成: parse/markdown-format-rejected\n`);
  
} catch (error) {
  console.log(`❌ 失败: parse/markdown-format-rejected`);
  console.log(`错误: ${error}\n`);
}

console.log('✨ Parse markdown 拒绝测试用例创建完成！');
