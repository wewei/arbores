import ts from 'typescript';

const code = `async function fetchData(url: string): Promise<any> { const response = await fetch(url); return response.json(); }`;
const sourceFile = ts.createSourceFile('test.ts', code, ts.ScriptTarget.Latest);
const printer = ts.createPrinter();
console.log(printer.printFile(sourceFile));
