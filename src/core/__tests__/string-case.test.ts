/**
 * String Case Conversion Utilities Tests
 */

import { describe, it, expect } from 'bun:test';
import { 
  toCamelCase, 
  toKebabCase, 
  pascalCaseToCamelCase, 
  pascalCaseToKebabCase 
} from '../utils/string-case';

describe('pascalCaseToCamelCase', () => {
  describe('基本转换', () => {
    it('应该将单个大写字母转换为小写', () => {
      expect(pascalCaseToCamelCase('Identifier')).toBe('identifier');
    });

    it('应该将普通PascalCase转换为camelCase', () => {
      expect(pascalCaseToCamelCase('StringLiteral')).toBe('stringLiteral');
      expect(pascalCaseToCamelCase('FunctionDeclaration')).toBe('functionDeclaration');
    });
  });

  describe('连续大写字母处理', () => {
    it('应该正确处理开头的两个大写字母后跟小写字母', () => {
      expect(pascalCaseToCamelCase('JSDocCallbackTag')).toBe('jsDocCallbackTag');
      expect(pascalCaseToCamelCase('JSDocComment')).toBe('jsDocComment');
      expect(pascalCaseToCamelCase('JSDocText')).toBe('jsDocText');
    });

    it('应该正确处理开头的多个大写字母后跟小写字母', () => {
      expect(pascalCaseToCamelCase('HTMLElement')).toBe('htmlElement');
      expect(pascalCaseToCamelCase('XMLHttpRequest')).toBe('xmlHttpRequest');
      expect(pascalCaseToCamelCase('CSSStyleRule')).toBe('cssStyleRule');
      expect(pascalCaseToCamelCase('URLPattern')).toBe('urlPattern');
    });

    it('应该正确处理全大写的缩写词', () => {
      expect(pascalCaseToCamelCase('JSX')).toBe('jsx');
      expect(pascalCaseToCamelCase('API')).toBe('api');
      expect(pascalCaseToCamelCase('HTTP')).toBe('http');
      expect(pascalCaseToCamelCase('CSS')).toBe('css');
      expect(pascalCaseToCamelCase('XML')).toBe('xml');
      expect(pascalCaseToCamelCase('HTML')).toBe('html');
    });

    it('应该正确处理开头缩写词后跟其他词', () => {
      expect(pascalCaseToCamelCase('IOError')).toBe('ioError');
      expect(pascalCaseToCamelCase('OSType')).toBe('osType');
      expect(pascalCaseToCamelCase('HTTPSConnection')).toBe('httpsConnection');
    });
  });

  describe('数字处理', () => {
    it('应该正确处理包含数字的字符串', () => {
      expect(pascalCaseToCamelCase('Version2')).toBe('version2');
      expect(pascalCaseToCamelCase('ES6Module')).toBe('es6Module');
      expect(pascalCaseToCamelCase('HTML5Parser')).toBe('html5Parser');
      expect(pascalCaseToCamelCase('Version2API')).toBe('version2Api');
    });

    it('应该正确处理连续数字', () => {
      expect(pascalCaseToCamelCase('Version123')).toBe('version123');
      expect(pascalCaseToCamelCase('API2024Version')).toBe('api2024Version');
    });
  });

  describe('边界情况', () => {
    it('应该处理空字符串', () => {
      expect(pascalCaseToCamelCase('')).toBe('');
    });

    it('应该处理单个字符', () => {
      expect(pascalCaseToCamelCase('A')).toBe('a');
      expect(pascalCaseToCamelCase('a')).toBe('a');
    });
  });
});

describe('pascalCaseToKebabCase', () => {
  describe('基本转换', () => {
    it('应该将PascalCase转换为kebab-case', () => {
      expect(pascalCaseToKebabCase('Identifier')).toBe('identifier');
      expect(pascalCaseToKebabCase('StringLiteral')).toBe('string-literal');
      expect(pascalCaseToKebabCase('FunctionDeclaration')).toBe('function-declaration');
    });
  });

  describe('连续大写字母处理', () => {
    it('应该正确处理开头的缩写词', () => {
      expect(pascalCaseToKebabCase('JSDoc')).toBe('js-doc');
      expect(pascalCaseToKebabCase('JSDocCallbackTag')).toBe('js-doc-callback-tag');
      expect(pascalCaseToKebabCase('JSDocComment')).toBe('js-doc-comment');
    });

    it('应该正确处理多个缩写词', () => {
      expect(pascalCaseToKebabCase('HTMLElement')).toBe('html-element');
      expect(pascalCaseToKebabCase('XMLHttpRequest')).toBe('xml-http-request');
      expect(pascalCaseToKebabCase('CSSStyleRule')).toBe('css-style-rule');
      expect(pascalCaseToKebabCase('URLPattern')).toBe('url-pattern');
    });

    it('应该正确处理全大写的缩写词', () => {
      expect(pascalCaseToKebabCase('JSX')).toBe('jsx');
      expect(pascalCaseToKebabCase('API')).toBe('api');
      expect(pascalCaseToKebabCase('HTTP')).toBe('http');
      expect(pascalCaseToKebabCase('CSS')).toBe('css');
      expect(pascalCaseToKebabCase('XML')).toBe('xml');
      expect(pascalCaseToKebabCase('HTML')).toBe('html');
    });

    it('应该正确处理复杂的缩写词组合', () => {
      expect(pascalCaseToKebabCase('IOError')).toBe('io-error');
      expect(pascalCaseToKebabCase('HTTPSConnection')).toBe('https-connection');
      expect(pascalCaseToKebabCase('JSONRPCRequest')).toBe('jsonrpc-request');
    });
  });

  describe('数字处理', () => {
    it('应该正确处理包含数字的字符串', () => {
      expect(pascalCaseToKebabCase('Version2')).toBe('version-2');
      expect(pascalCaseToKebabCase('ES6Module')).toBe('es-6-module');
      expect(pascalCaseToKebabCase('HTML5Parser')).toBe('html-5-parser');
      expect(pascalCaseToKebabCase('Version2API')).toBe('version-2-api');
    });

    it('应该正确处理连续数字', () => {
      expect(pascalCaseToKebabCase('Version123')).toBe('version-123');
      expect(pascalCaseToKebabCase('API2024Version')).toBe('api-2024-version');
    });
  });

  describe('边界情况', () => {
    it('应该处理空字符串', () => {
      expect(pascalCaseToKebabCase('')).toBe('');
    });

    it('应该处理单个字符', () => {
      expect(pascalCaseToKebabCase('A')).toBe('a');
      expect(pascalCaseToKebabCase('a')).toBe('a');
    });
  });

  describe('实际TypeScript SyntaxKind示例', () => {
    it('应该正确转换常见的SyntaxKind', () => {
      expect(pascalCaseToKebabCase('EndOfFileToken')).toBe('end-of-file-token');
      expect(pascalCaseToKebabCase('SingleLineCommentTrivia')).toBe('single-line-comment-trivia');
      expect(pascalCaseToKebabCase('MultiLineCommentTrivia')).toBe('multi-line-comment-trivia');
      expect(pascalCaseToKebabCase('NewLineTrivia')).toBe('new-line-trivia');
      expect(pascalCaseToKebabCase('JsxText')).toBe('jsx-text');
      expect(pascalCaseToKebabCase('JsxTextAllWhiteSpaces')).toBe('jsx-text-all-white-spaces');
      expect(pascalCaseToKebabCase('RegularExpressionLiteral')).toBe('regular-expression-literal');
      expect(pascalCaseToKebabCase('NoSubstitutionTemplateLiteral')).toBe('no-substitution-template-literal');
    });
  });
});

describe('向后兼容性', () => {
  describe('toCamelCase (已弃用)', () => {
    it('应该与 pascalCaseToCamelCase 行为一致', () => {
      expect(toCamelCase('JSDocCallbackTag')).toBe(pascalCaseToCamelCase('JSDocCallbackTag'));
      expect(toCamelCase('HTMLElement')).toBe(pascalCaseToCamelCase('HTMLElement'));
      expect(toCamelCase('Identifier')).toBe(pascalCaseToCamelCase('Identifier'));
    });
  });

  describe('toKebabCase (已弃用)', () => {
    it('应该与 pascalCaseToKebabCase 行为一致', () => {
      expect(toKebabCase('JSDocCallbackTag')).toBe(pascalCaseToKebabCase('JSDocCallbackTag'));
      expect(toKebabCase('HTMLElement')).toBe(pascalCaseToKebabCase('HTMLElement'));
      expect(toKebabCase('Identifier')).toBe(pascalCaseToKebabCase('Identifier'));
    });
  });
});
