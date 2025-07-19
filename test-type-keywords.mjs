// Test the type keyword nodes
import { createNode } from './src/ast-builder/index.ts';
import { parseASTFile, readFile } from './src/utils.ts';
import * as ts from 'typescript';

async function testTypeKeywords() {
  try {
    const astContent = await readFile('samples/basic-expressions.ast.json');
    const ast = parseASTFile(astContent, 'json');
    
    console.log('Testing type keyword generation...\n');
    
    // Find the root node and generate code
    const latestVersion = ast.versions[ast.versions.length - 1];
    const rootNode = ast.nodes[latestVersion.root_node_id];
    
    if (!rootNode) {
      console.log('Root node not found!');
      return;
    }
    
    // Generate the full TypeScript source file from AST
    const sourceFile = createNode(ast, rootNode);
    
    // Print the generated code
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(sourceFile);
    
    console.log('Generated TypeScript code:');
    console.log(result.substring(0, 1000) + '...'); // Show first 1000 chars
    
  } catch (error) {
    console.error('Error:', error);
    console.error(error.stack);
  }
}

testTypeKeywords();
