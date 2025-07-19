// Quick test for TypeReference
import { createNode } from './src/ast-builder/index.ts';
import { parseASTFile, readFile } from './src/utils.ts';
import * as ts from 'typescript';

async function testTypeReference() {
  try {
    const astContent = await readFile('samples/basic-expressions.ast.json');
    const ast = parseASTFile(astContent, 'json');
    
    console.log('Testing full code generation...');
    
    // Generate the full source file
    const latestVersion = ast.versions[ast.versions.length - 1];
    const rootNode = ast.nodes[latestVersion.root_node_id];
    
    const sourceFile = createNode(ast, rootNode);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(sourceFile);
    
    // Look for the part with User interface and variable declaration
    const lines = result.split('\n');
    const userLines = lines.filter((line, idx) => 
      line.includes('User') || 
      (idx > 0 && lines[idx-1].includes('User')) ||
      (idx < lines.length - 1 && lines[idx+1].includes('User'))
    );
    
    console.log('Lines containing User references:');
    userLines.forEach(line => console.log('  ', line));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testTypeReference();
