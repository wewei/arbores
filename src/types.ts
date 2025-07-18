import * as ts from 'typescript';

// AST 节点类型
export type ASTNode = {
  id: string;
  kind: number;
  text?: string;
  properties?: Record<string, any>;
  children?: string[];
};

// 文件版本类型
export type FileVersion = {
  version_id: string;
  created_at: string;
  root_node_id: string;
  description?: string;
};

// 源文件 AST 存储类型
export type SourceFileAST = {
  file_name: string;
  versions: FileVersion[];
  nodes: Record<string, ASTNode>;
};

// 解析选项类型
export type ParseOptions = {
  outputFile?: string;
  dryRun?: boolean;
  description?: string;
};

// 字符串化选项类型
export type StringifyOptions = {
  format?: 'compact' | 'readable' | 'minified';
}; 