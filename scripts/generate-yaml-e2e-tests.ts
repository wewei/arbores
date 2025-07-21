#!/usr/bin/env bun
/**
 * 生成 YAML 支持的 e2e 测试用例
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface TestCase {
  description: string;
  command: string[];
  exitCode: number;
  environment?: Record<string, string>;
}

const baselinesDir = 'src/cli/__tests__/e2e/baselines';

// 定义要添加的 YAML 支持测试用例
const yamlTestCases: Record<string, TestCase[]> = {
  // stringify 命令的 YAML 输入测试
  stringify: [
    {
      description: 'Stringify simple export from YAML AST file',
      command: ['stringify', 'src\\cli\\__tests__\\fixtures\\export-simple.ast.yaml', '--format', 'readable'],
      exitCode: 0,
      environment: {}
    },
    {
      description: 'Stringify class from YAML AST file',
      command: ['stringify', 'src\\cli\\__tests__\\fixtures\\class-test.ast.yaml', '--format', 'readable'],
      exitCode: 0,
      environment: {}
    },
    {
      description: 'Stringify function from YAML AST file',
      command: ['stringify', 'src\\cli\\__tests__\\fixtures\\function-test.ast.yaml', '--format', 'readable'],
      exitCode: 0,
      environment: {}
    }
  ],
  
  // roots 命令的 YAML 输入测试
  roots: [
    {
      description: 'Get roots from YAML AST file',
      command: ['roots', 'src\\cli\\__tests__\\fixtures\\simple.ast.yaml'],
      exitCode: 0,
      environment: {}
    },
    {
      description: 'Get roots from YAML AST file with latest flag',
      command: ['roots', 'src\\cli\\__tests__\\fixtures\\simple.ast.yaml', '--latest'],
      exitCode: 0,
      environment: {}
    }
  ],
  
  // children 命令的 YAML 输入测试
  children: [
    {
      description: 'Get children from YAML AST file',
      command: ['children', 'src\\cli\\__tests__\\fixtures\\simple.ast.yaml'],
      exitCode: 0,
      environment: {}
    }
  ],
  
  // parents 命令的 YAML 输入测试
  parents: [
    {
      description: 'Get parents from YAML AST file',
      command: ['parents', 'src\\cli\\__tests__\\fixtures\\simple.ast.yaml'],
      exitCode: 0,
      environment: {}
    }
  ],
  
  // tree 命令的 YAML 输入测试
  tree: [
    {
      description: 'Display tree from YAML AST file',
      command: ['tree', 'src\\cli\\__tests__\\fixtures\\simple.ast.yaml'],
      exitCode: 0,
      environment: {}
    }
  ],
  
  // node 命令的 YAML 输入测试
  node: [
    {
      description: 'Display node info from YAML AST file',
      command: ['node', 'src\\cli\\__tests__\\fixtures\\simple.ast.yaml', '-n', 'd34879e61c10bc93'],
      exitCode: 0,
      environment: {}
    }
  ]
};

console.log('🔄 开始生成 YAML 支持的 e2e 测试用例...\n');

for (const [commandName, testCases] of Object.entries(yamlTestCases)) {
  const commandDir = path.join(baselinesDir, commandName);
  
  if (!fs.existsSync(commandDir)) {
    console.log(`⚠️  命令目录不存在: ${commandName}`);
    continue;
  }
  
  for (const testCase of testCases) {
    // 生成测试用例目录名
    const testDirName = testCase.description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const testDir = path.join(commandDir, `yaml-${testDirName}`);
    
    // 如果目录已存在，跳过
    if (fs.existsSync(testDir)) {
      console.log(`⚠️  测试用例已存在，跳过: ${commandName}/yaml-${testDirName}`);
      continue;
    }
    
    // 创建测试目录
    fs.mkdirSync(testDir, { recursive: true });
    
    // 创建 metadata.yaml
    const metadata = {
      description: testCase.description,
      command: testCase.command,
      exitCode: testCase.exitCode,
      environment: testCase.environment || {},
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    const metadataPath = path.join(testDir, 'metadata.yaml');
    fs.writeFileSync(metadataPath, yaml.dump(metadata, { indent: 2 }), 'utf-8');
    
    console.log(`✅ 已创建测试用例: ${commandName}/yaml-${testDirName}`);
  }
}

console.log('\n✨ YAML e2e 测试用例生成完成！');
console.log('💡 提示：运行以下命令生成测试基线：');
console.log('   bun scripts/generate-e2e-baseline.ts --update');
