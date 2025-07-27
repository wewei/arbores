/**
 * Main stringifier function generation
 */

import type { StringifierGeneratorState } from '../types';
import { getNodeTypeName, capitalize } from '../utils';

/**
 * Generate the main function type definition
 */
export const generateMainFunctionType = (state: StringifierGeneratorState): string => {
  const mainFunctionName = `${state.config.functionPrefix}${state.model.name}`;
  const rootType = getNodeTypeName(state, state.model.start);

  return `/**
 * Main stringifier function type
 */
export type ${capitalize(mainFunctionName)}Function = (
  node: ${rootType}, 
  options?: StringifierOptions
) => string;`;
};

/**
 * Generate the main stringifier function that dispatches to specific node functions
 */
export const generateMainStringifierFunction = (state: StringifierGeneratorState): string => {
  const functionName = `${state.config.functionPrefix}${state.model.name}`;
  const rootType = getNodeTypeName(state, state.model.start);

  return `/**
 * Main stringifier function for ${state.model.name} nodes
 */
export function ${functionName}(node: ${rootType}, options: StringifierOptions = {}): string {
  const opts = {
    indent: 0,
    indentString: '${state.config.indentStyle}',
    includeWhitespace: ${state.config.includeWhitespace},
    format: ${state.config.includeFormatting},
    ...options,
  };

  return stringifyNode(node, opts);
}

/**
 * Generic node stringifier function that dispatches to specific node types
 */
export function stringifyNode(node: any, options: StringifierOptions): string {
  if (!node || typeof node !== 'object' || !node.type) {
    throw new Error('Invalid node: must have a type property');
  }

  switch (node.type) {${generateDispatchCases(state)}
    default:
      throw new Error(\`Unknown node type: \${node.type}\`);
  }
}`;
};

/**
 * Generate switch cases for the main dispatch function
 */
export const generateDispatchCases = (state: StringifierGeneratorState): string => {
  const cases: string[] = [];

  for (const [nodeName, node] of Object.entries(state.model.nodes)) {
    const functionName = `${state.config.functionPrefix}${nodeName}`;
    cases.push(`
    case '${nodeName}':
      return ${functionName}(node, options);`);
  }

  return cases.join('');
};
