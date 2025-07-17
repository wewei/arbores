// Re-export CLI for programmatic usage
export { parseFile, mergeAST } from './src/parser';
export { stringifyNode } from './src/stringifier';
export type { SourceFileAST, ASTNode, FileVersion } from './src/types';