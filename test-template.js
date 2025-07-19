const ts = require('typescript');

// 创建一个简单的模板字符串
const sourceCode = 'const msg = `Hello, ${name}!`;';
const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.ES2015, true);

// 打印生成的代码
const printer = ts.createPrinter();
const output = printer.printFile(sourceFile);
console.log('Expected output:', output.trim());

// 手动创建template expression
const head = ts.factory.createTemplateHead('Hello, ${');
const expression = ts.factory.createIdentifier('name');
const tail = ts.factory.createTemplateTail('}!');
const span = ts.factory.createTemplateSpan(expression, tail);
const template = ts.factory.createTemplateExpression(head, [span]);

console.log('Manual template parts:');
console.log('Head text:', JSON.stringify(head.text));
console.log('Tail text:', JSON.stringify(tail.text));
