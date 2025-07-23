/**
 * String Case Conversion Utilities
 * 
 * Utilities for converting between different string casing conventions,
 * with special handling for consecutive uppercase letters (acronyms) and numbers.
 */

/**
 * 将PascalCase字符串分词
 * 正确处理连续大写字母和数字
 * 
 * @param str PascalCase字符串
 * @returns 分词结果数组
 * 
 * @example
 * ```typescript
 * splitPascalCase('JSDocCallbackTag') // ['JS', 'Doc', 'Callback', 'Tag']
 * splitPascalCase('HTMLElement') // ['HTML', 'Element']
 * splitPascalCase('Version2API') // ['Version', '2', 'API']
 * splitPascalCase('XMLHttpRequest') // ['XML', 'Http', 'Request']
 * ```
 */
function splitPascalCase(str: string): string[] {
  if (!str) return [];
  
  const words: string[] = [];
  let currentWord = '';
  let i = 0;
  
  while (i < str.length) {
    const char = str.charAt(i);
    
    if (char >= 'A' && char <= 'Z') {
      // 大写字母
      if (currentWord && !(currentWord.charAt(currentWord.length - 1) >= 'A' && currentWord.charAt(currentWord.length - 1) <= 'Z')) {
        // 前一个字符不是大写字母，开始新单词
        words.push(currentWord);
        currentWord = char;
      } else {
        // 连续大写字母
        currentWord += char;
        
        // 检查下一个字符是否为小写字母
        if (i + 1 < str.length && str.charAt(i + 1) >= 'a' && str.charAt(i + 1) <= 'z') {
          // 下一个是小写字母，当前大写字母是新单词的开始
          if (currentWord.length > 1) {
            // 分割：前面的大写字母为一个单词，当前字母开始新单词
            words.push(currentWord.slice(0, -1));
            currentWord = char;
          }
        }
      }
    } else if (char >= '0' && char <= '9') {
      // 数字
      if (currentWord && !(currentWord.charAt(currentWord.length - 1) >= '0' && currentWord.charAt(currentWord.length - 1) <= '9')) {
        // 前一个字符不是数字，开始新单词
        words.push(currentWord);
        currentWord = char;
      } else {
        // 连续数字
        currentWord += char;
      }
    } else {
      // 小写字母或其他字符
      currentWord += char;
    }
    
    i++;
  }
  
  if (currentWord) {
    words.push(currentWord);
  }
  
  return words;
}

/**
 * 将PascalCase转换为camelCase
 * 正确处理开头的连续大写字母（如缩写词）和数字
 * 
 * @param str PascalCase字符串
 * @returns camelCase字符串
 * 
 * @example
 * ```typescript
 * pascalCaseToCamelCase('JSDocCallbackTag') // 'jsDocCallbackTag'
 * pascalCaseToCamelCase('JSX') // 'jsx'
 * pascalCaseToCamelCase('HTMLElement') // 'htmlElement'
 * pascalCaseToCamelCase('Identifier') // 'identifier'
 * pascalCaseToCamelCase('Version2API') // 'version2Api'
 * ```
 */
export function pascalCaseToCamelCase(str: string): string {
  const words = splitPascalCase(str);
  if (words.length === 0) return '';
  
  // 第一个单词全部小写，其余单词首字母大写
  return words
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      } else {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    })
    .join('');
}

/**
 * 将PascalCase转换为kebab-case
 * 正确处理连续的大写字母（如缩写词）和数字
 * 
 * @param str PascalCase字符串
 * @returns kebab-case字符串
 * 
 * @example
 * ```typescript
 * pascalCaseToKebabCase('JSDoc') // 'js-doc'
 * pascalCaseToKebabCase('HTMLElement') // 'html-element'
 * pascalCaseToKebabCase('XMLHttpRequest') // 'xml-http-request'
 * pascalCaseToKebabCase('Identifier') // 'identifier'
 * pascalCaseToKebabCase('Version2API') // 'version2-api'
 * ```
 */
export function pascalCaseToKebabCase(str: string): string {
  const words = splitPascalCase(str);
  if (words.length === 0) return '';
  
  // 所有单词都转为小写，用连字符连接
  return words
    .map(word => word.toLowerCase())
    .join('-');
}

// 保持向后兼容的别名
/**
 * @deprecated 使用 pascalCaseToCamelCase 代替
 */
export const toCamelCase = pascalCaseToCamelCase;

/**
 * @deprecated 使用 pascalCaseToKebabCase 代替
 */
export const toKebabCase = pascalCaseToKebabCase;
