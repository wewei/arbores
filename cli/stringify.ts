import type { StringifyOptions } from '../src/types';
import { stringifyNode } from '../src/stringifier';
import { readFile } from '../src/utils';

export async function stringifyCommand(
  filePath: string,
  nodeId: string | undefined,
  options: { format?: string }
): Promise<void> {
  try {
    // 读取 AST JSON 文件
    const content = await readFile(filePath);
    const ast = JSON.parse(content);
    
    // 如果没有提供 nodeId，使用 latest root
    let targetNodeId: string;
    if (!nodeId) {
      const latestVersion = ast.versions[ast.versions.length - 1];
      if (!latestVersion) {
        throw new Error('No versions found in AST file');
      }
      targetNodeId = latestVersion.root_node_id;
    } else {
      targetNodeId = nodeId;
    }
    
    // 验证格式选项
    const format = options.format as 'compact' | 'readable' | 'minified';
    if (!['compact', 'readable', 'minified'].includes(format)) {
      throw new Error('Invalid format. Must be one of: compact, readable, minified');
    }
    
    // 字符串化节点
    const result = stringifyNode(targetNodeId, ast, format);
    
    // 输出到 stdout
    console.log(result);
    
  } catch (error) {
    console.error('Error stringifying node:', error);
    process.exit(1);
  }
} 