import { parseTypeScriptFile } from './src/parser';
import { createNode } from './src/ast-builder';
import * as ts from 'typescript';
import * as fs from 'fs';

// 测试新的 AST Builder
console.log('Testing new AST Builder...');

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

// 获取根节点
const rootNode = ast.nodes[rootNodeId];

if (!rootNode) {
  console.log('❌ Root node not found in AST');
  process.exit(1);
}

console.log('🔧 Creating TypeScript nodes using new AST Builder...');

try {
  // 使用新的 AST Builder 创建 TypeScript 节点
  const tsNode = createNode<ts.SourceFile>(ast, rootNode);
  
  console.log('✅ Successfully created TypeScript SourceFile node');
  console.log('Node kind:', ts.SyntaxKind[tsNode.kind]);
  console.log('Statements count:', tsNode.statements.length);
  
  // 尝试生成代码
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printFile(tsNode);
  
  console.log('\n📄 Generated code:');
  console.log(result);
  
  // 验证是否包含我们期望的内容
  if (result.includes('function fetchData')) {
    console.log('\n✅ fetchData function found in generated code');
  } else {
    console.log('\n❌ fetchData function not found');
  }
  
  if (result.includes('async') && result.includes('await')) {
    console.log('✅ Async/await syntax preserved');
  } else {
    console.log('❌ Async/await syntax missing');
  }
  
} catch (error) {
  console.error('❌ Error creating TypeScript nodes:', error);
}

console.log('\n🎉 AST Builder test completed!');
