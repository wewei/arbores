#!/usr/bin/env bun
/**
 * 创建 YAML 格式的 AST 文件以支持 e2e 测试
 */

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

const fixturesDir = 'src/cli/__tests__/fixtures';

// 选择一些关键的文件转换为 YAML 格式
const filesToConvert = [
  'export-simple.ast.json',  // 用于 stringify YAML 输入测试
  'class-test.ast.json',     // 用于复杂结构的 YAML 测试
  'function-test.ast.json',  // 用于函数相关的 YAML 测试
];

console.log('🔄 开始转换 JSON AST 文件为 YAML 格式...\n');

for (const filename of filesToConvert) {
  const jsonPath = path.join(fixturesDir, filename);
  const yamlPath = path.join(fixturesDir, filename.replace('.json', '.yaml'));
  
  if (!fs.existsSync(jsonPath)) {
    console.log(`⚠️  跳过不存在的文件: ${filename}`);
    continue;
  }
  
  if (fs.existsSync(yamlPath)) {
    console.log(`⚠️  YAML 文件已存在，跳过: ${filename.replace('.json', '.yaml')}`);
    continue;
  }
  
  try {
    // 读取 JSON 文件
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const astData = JSON.parse(jsonContent);
    
    // 转换为 YAML 格式
    const yamlContent = yaml.dump(astData, {
      indent: 2,
      lineWidth: 120,
      noRefs: true
    });
    
    // 写入 YAML 文件
    fs.writeFileSync(yamlPath, yamlContent, 'utf-8');
    
    console.log(`✅ 已转换: ${filename} → ${filename.replace('.json', '.yaml')}`);
  } catch (error) {
    console.log(`❌ 转换失败 ${filename}: ${error}`);
  }
}

console.log('\n✨ 转换完成！');
