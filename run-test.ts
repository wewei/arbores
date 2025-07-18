import { parseTypeScriptFile } from './src/parser';
import { stringifyNode } from './src/stringifier';
import * as fs from 'fs';

// 测试 fetchData 函数
console.log('Testing fetchData function stringification...');

// 读取测试文件
const testCode = fs.readFileSync('./test.ts', 'utf8');

// 解析 AST
const ast = parseTypeScriptFile('./test.ts', testCode);

// 获取根节点 ID
const rootNodeId = ast.versions[0]?.root_node_id;

if (!rootNodeId) {
  console.log('❌ No root node found');
  process.exit(1);
}

// 生成代码
const result = stringifyNode(rootNodeId, ast);

console.log('Generated code:');
console.log(result);

// 检查是否包含完整的 fetchData 函数
const expectedFetchData = 'async function fetchData(url: string): Promise<any> {\n    const response = await fetch(url);\n    return response.json();\n}';

if (result.includes('async function fetchData(url: string): Promise<any>')) {
  console.log('\n✅ fetchData function signature is correct');
} else {
  console.log('\n❌ fetchData function signature is incorrect');
}

if (result.includes('const response = await fetch(url);')) {
  console.log('✅ fetchData function body contains await fetch');
} else {
  console.log('❌ fetchData function body missing await fetch');
}

if (result.includes('return response.json();')) {
  console.log('✅ fetchData function body contains return response.json()');
} else {
  console.log('❌ fetchData function body missing return response.json()');
}

console.log('\n🎉 Test completed!');
