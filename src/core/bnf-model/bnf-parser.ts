/**
 * BNF Model Parser
 * 
 * This module provides type-safe parsing for BNF models from any input (JSON/YAML),
 * with comprehensive validation and error reporting.
 */

import type {
  BNFModel,
  BNFNode,
  TokenNode,
  DeductionNode,
  UnionNode,
  DeductionElement,
  ParseResult
} from './types.js';

/**
 * Parses and validates a BNF model from any input type
 * 
 * @param input - Raw input data (typically from JSON.parse() or YAML.parse())
 * @returns ParseResult with either the validated model or errors
 */
export function parseBNF(input: any): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic type and structure validation
  if (!input || typeof input !== 'object') {
    return { success: false, errors: ['Input must be an object'] };
  }

  // Validate required top-level fields
  if (!input.name || typeof input.name !== 'string') {
    errors.push('Model must have a valid name (non-empty string)');
  }

  if (!input.version || typeof input.version !== 'string') {
    errors.push('Model must have a valid version (non-empty string)');
  }

  if (!input.start || typeof input.start !== 'string') {
    errors.push('Model must have a valid start node name (non-empty string)');
  }

  if (!input.nodes || typeof input.nodes !== 'object') {
    errors.push('Model must have a nodes object');
    return { success: false, errors };
  }

  // Parse and validate nodes
  const parsedNodes: Record<string, BNFNode> = {};
  const nodeNames = Object.keys(input.nodes);

  for (const [nodeName, nodeData] of Object.entries(input.nodes)) {
    const nodeResult = parseNode(nodeName, nodeData, nodeNames);
    if (!nodeResult.success) {
      errors.push(...nodeResult.errors);
    } else {
      parsedNodes[nodeName] = nodeResult.node;
      // Validate regex patterns
      if (nodeResult.node.type === 'token' && typeof nodeResult.node.pattern === 'object' && nodeResult.node.pattern.regex) {
        const regexErrors = validateRegexPattern(nodeResult.node.pattern.regex, nodeName);
        errors.push(...regexErrors);
      }
    }
  }

  // Check if start node exists
  if (input.start && !parsedNodes[input.start]) {
    errors.push(`Start node "${input.start}" is not defined in nodes`);
  }

  // If we have parsing errors, return them
  if (errors.length > 0) {
    return { success: false, errors, warnings: warnings.length > 0 ? warnings : undefined };
  }

  // Create the model
  const model: BNFModel = {
    name: input.name,
    version: input.version,
    start: input.start,
    nodes: parsedNodes,
    ...(input.metadata && { metadata: input.metadata })
  };

  // Perform structural validations
  const structuralErrors = validateModelStructure(model);
  if (structuralErrors.length > 0) {
    return { success: false, errors: structuralErrors, warnings: warnings.length > 0 ? warnings : undefined };
  }

  // Check for orphan nodes (warnings only)
  const orphanNodes = findOrphanNodes(model);
  if (orphanNodes.length > 0) {
    // Add one warning per orphan node
    orphanNodes.forEach(nodeName => {
      warnings.push(`Orphan node (unreferenced): ${nodeName}`);
    });
    // Add summary line
    warnings.push(`Found ${orphanNodes.length} orphan node(s) total. Consider removing if not needed, or check if references are missing.`);
  }

  return { 
    success: true, 
    model, 
    warnings: warnings.length > 0 ? warnings : undefined 
  };
}

/**
 * Parse result for individual nodes
 */
type NodeParseResult =
  | { success: true; node: BNFNode }
  | { success: false; errors: string[] };

/**
 * Parses and validates a single BNF node
 */
function parseNode(nodeName: string, nodeData: any, allNodeNames: string[]): NodeParseResult {
  const errors: string[] = [];

  // Basic node structure validation
  if (!nodeData || typeof nodeData !== 'object') {
    return { success: false, errors: [`Node "${nodeName}" must be an object`] };
  }

  if (!nodeData.type) {
    errors.push(`Node "${nodeName}" must have a type`);
  }

  if (!nodeData.description || typeof nodeData.description !== 'string') {
    errors.push(`Node "${nodeName}" must have a description (non-empty string)`);
  }

  // Parse based on node type
  let parsedNode: BNFNode;
  switch (nodeData.type) {
    case 'token': {
      const tokenResult = parseTokenNode(nodeName, nodeData);
      if (!tokenResult.success) {
        errors.push(...tokenResult.errors);
        return { success: false, errors };
      }
      parsedNode = tokenResult.node;
      break;
    }
    case 'deduction': {
      const deductionResult = parseDeductionNode(nodeName, nodeData, allNodeNames);
      if (!deductionResult.success) {
        errors.push(...deductionResult.errors);
        return { success: false, errors };
      }
      parsedNode = deductionResult.node;
      break;
    }
    case 'union': {
      const unionResult = parseUnionNode(nodeName, nodeData, allNodeNames);
      if (!unionResult.success) {
        errors.push(...unionResult.errors);
        return { success: false, errors };
      }
      parsedNode = unionResult.node;
      break;
    }
    default:
      return { success: false, errors: [`Node "${nodeName}" has invalid type: ${nodeData.type}`] };
  }

  return { success: true, node: parsedNode };
}

/**
 * Parses a Token node
 */
function parseTokenNode(nodeName: string, nodeData: any): NodeParseResult {
  const errors: string[] = [];

  if (!nodeData.pattern) {
    return { success: false, errors: [`Token node "${nodeName}" must have a pattern`] };
  }

  let pattern: string | { regex: string; flags?: string };

  if (typeof nodeData.pattern === 'string') {
    // String pattern validation
    if (nodeData.pattern.length === 0) {
      errors.push(`Token node "${nodeName}" pattern cannot be empty string`);
    }
    if (/\s/.test(nodeData.pattern)) {
      errors.push(`Token node "${nodeName}" string pattern cannot contain whitespace`);
    }
    pattern = nodeData.pattern;
  } else if (typeof nodeData.pattern === 'object' && nodeData.pattern.regex) {
    // Regex pattern validation
    try {
      new RegExp(nodeData.pattern.regex, nodeData.pattern.flags);
      pattern = {
        regex: nodeData.pattern.regex,
        ...(nodeData.pattern.flags && { flags: nodeData.pattern.flags })
      };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      errors.push(`Token node "${nodeName}" has invalid regex pattern: ${error}`);
    }
  } else {
    errors.push(`Token node "${nodeName}" pattern must be string or {regex: string, flags?: string}`);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const tokenNode: TokenNode = {
    type: 'token',
    description: nodeData.description,
    pattern: pattern!,
    ...(nodeData.metadata && { metadata: nodeData.metadata })
  };

  return { success: true, node: tokenNode };
}

/**
 * Parses a Deduction node
 */
function parseDeductionNode(nodeName: string, nodeData: any, allNodeNames: string[]): NodeParseResult {
  const errors: string[] = [];

  if (!Array.isArray(nodeData.sequence)) {
    return { success: false, errors: [`Deduction node "${nodeName}" must have a sequence array`] };
  }

  if (nodeData.sequence.length === 0) {
    errors.push(`Deduction node "${nodeName}" sequence cannot be empty`);
  }

  // Parse sequence elements
  const sequence: DeductionElement[] = [];
  for (let i = 0; i < nodeData.sequence.length; i++) {
    const elementData = nodeData.sequence[i];
    const elementResult = parseDeductionElement(nodeName, i, elementData, allNodeNames);
    if (!elementResult.success) {
      errors.push(...elementResult.errors);
    } else {
      sequence.push(elementResult.element);
    }
  }

  // Validate optional fields
  let precedence: number | undefined;
  if (nodeData.precedence !== undefined) {
    if (typeof nodeData.precedence !== 'number' || nodeData.precedence < 0) {
      errors.push(`Deduction node "${nodeName}" precedence must be a non-negative number`);
    } else {
      precedence = nodeData.precedence;
    }
  }

  let associativity: 'left' | 'right' | 'non-associative' | undefined;
  if (nodeData.associativity !== undefined) {
    const validAssoc = ['left', 'right', 'non-associative'] as const;
    if (!validAssoc.includes(nodeData.associativity)) {
      errors.push(`Deduction node "${nodeName}" associativity must be one of: ${validAssoc.join(', ')}`);
    } else {
      associativity = nodeData.associativity;
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const deductionNode: DeductionNode = {
    type: 'deduction',
    description: nodeData.description,
    sequence,
    ...(precedence !== undefined && { precedence }),
    ...(associativity && { associativity }),
    ...(nodeData.metadata && { metadata: nodeData.metadata })
  };

  return { success: true, node: deductionNode };
}

/**
 * Parse result for deduction elements
 */
type ElementParseResult =
  | { success: true; element: DeductionElement }
  | { success: false; errors: string[] };

/**
 * Parses a DeductionElement
 */
function parseDeductionElement(
  nodeName: string,
  index: number,
  elementData: any,
  allNodeNames: string[]
): ElementParseResult {
  const errors: string[] = [];

  if (typeof elementData === 'string') {
    // String reference - validate existence
    if (!allNodeNames.includes(elementData)) {
      errors.push(`Deduction node "${nodeName}" sequence[${index}]: referenced node "${elementData}" does not exist`);
    }
    return errors.length > 0
      ? { success: false, errors }
      : { success: true, element: elementData };
  }

  if (typeof elementData === 'object' && elementData !== null) {
    // Object reference validation
    if (typeof elementData.node !== 'string') {
      errors.push(`Deduction node "${nodeName}" sequence[${index}]: element.node must be a string`);
    } else if (!allNodeNames.includes(elementData.node)) {
      errors.push(`Deduction node "${nodeName}" sequence[${index}]: referenced node "${elementData.node}" does not exist`);
    }

    if (typeof elementData.prop !== 'string') {
      errors.push(`Deduction node "${nodeName}" sequence[${index}]: element.prop must be a string`);
    } else if (!isValidPropertyName(elementData.prop)) {
      errors.push(`Deduction node "${nodeName}" sequence[${index}]: property name "${elementData.prop}" is not valid camelCase`);
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      element: { node: elementData.node, prop: elementData.prop }
    };
  }

  return {
    success: false,
    errors: [`Deduction node "${nodeName}" sequence[${index}]: element must be string or {node: string, prop: string}`]
  };
}

/**
 * Parses a Union node
 */
function parseUnionNode(nodeName: string, nodeData: any, allNodeNames: string[]): NodeParseResult {
  const errors: string[] = [];

  if (!Array.isArray(nodeData.members)) {
    return { success: false, errors: [`Union node "${nodeName}" must have a members array`] };
  }

  if (nodeData.members.length === 0) {
    errors.push(`Union node "${nodeName}" members cannot be empty`);
  }

  // Validate members
  const members: string[] = [];
  for (const member of nodeData.members) {
    if (typeof member !== 'string') {
      errors.push(`Union node "${nodeName}" member must be string, got: ${typeof member}`);
    } else if (!allNodeNames.includes(member)) {
      errors.push(`Union node "${nodeName}" member "${member}" does not exist`);
    } else {
      members.push(member);
    }
  }

  // Check for duplicate members
  const uniqueMembers = new Set(members);
  if (uniqueMembers.size !== members.length) {
    errors.push(`Union node "${nodeName}" has duplicate members`);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const unionNode: UnionNode = {
    type: 'union',
    description: nodeData.description,
    members,
    ...(nodeData.metadata && { metadata: nodeData.metadata })
  };

  return { success: true, node: unionNode };
}

/**
 * Validates a regex pattern to ensure it can be parsed by JavaScript RegExp
 */
function validateRegexPattern(pattern: string, nodeName: string): string[] {
  const errors: string[] = [];
  
  try {
    // Try to create a RegExp object to validate the pattern
    new RegExp(pattern);
  } catch (error) {
    errors.push(`Token node "${nodeName}" has invalid regex pattern: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return errors;
}

/**
 * Finds orphan (unreferenced) nodes in the model
 */
function findOrphanNodes(model: BNFModel): string[] {
  const allNodeNames = new Set(Object.keys(model.nodes));
  const referencedNodes = new Set<string>();

  // Add the start node as referenced
  if (model.start && allNodeNames.has(model.start)) {
    referencedNodes.add(model.start);
  }

  // Find all node references
  for (const [nodeName, node] of Object.entries(model.nodes)) {
    const refs = getNodeDependencies(node);
    refs.forEach(ref => referencedNodes.add(ref));
  }

  // Find orphan nodes
  const orphanNodes: string[] = [];
  for (const nodeName of allNodeNames) {
    if (!referencedNodes.has(nodeName)) {
      orphanNodes.push(nodeName);
    }
  }

  return orphanNodes.sort();
}

/**
 * Validates structural integrity of the parsed model
 */
function validateModelStructure(model: BNFModel): string[] {
  const errors: string[] = [];

  // Validate token node references in deduction sequences
  const tokenValidationErrors = validateTokenNodeReferences(model);
  errors.push(...tokenValidationErrors);

  return errors;
}

/**
 * Checks if a property name is valid camelCase
 */
function isValidPropertyName(name: string): boolean {
  // camelCase: starts with lowercase letter, followed by letters/numbers, no underscores
  return /^[a-z][a-zA-Z0-9]*$/.test(name);
}

/**
 * Validates that string references in deduction sequences point to TokenNodes with string patterns
 */
function validateTokenNodeReferences(model: BNFModel): string[] {
  const errors: string[] = [];

  for (const [nodeName, node] of Object.entries(model.nodes)) {
    if (node.type === 'deduction') {
      for (let i = 0; i < node.sequence.length; i++) {
        const element = node.sequence[i];
        if (typeof element === 'string') {
          // This element must reference a TokenNode with string pattern
          const referencedNode = model.nodes[element];
          if (referencedNode) {
            if (referencedNode.type !== 'token') {
              errors.push(`Deduction node "${nodeName}" sequence[${i}]: string reference "${element}" must point to a TokenNode`);
            } else {
              const tokenNode = referencedNode as TokenNode;
              if (typeof tokenNode.pattern !== 'string') {
                errors.push(`Deduction node "${nodeName}" sequence[${i}]: string reference "${element}" must point to a TokenNode with string pattern`);
              }
            }
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Gets all node dependencies for a given node
 */
function getNodeDependencies(node: BNFNode): string[] {
  const deps: string[] = [];

  switch (node.type) {
    case 'token':
      // Token nodes have no dependencies
      break;
    case 'deduction':
      for (const element of node.sequence) {
        if (typeof element === 'string') {
          deps.push(element);
        } else if (typeof element === 'object' && element.node) {
          deps.push(element.node);
        }
      }
      break;
    case 'union':
      deps.push(...node.members);
      break;
  }

  return deps;
}

/**
 * Utility function to find unreachable nodes (for warnings/analysis)
 */
export function findUnreachableNodes(model: BNFModel): string[] {
  const reachable = new Set<string>();

  function dfs(nodeName: string): void {
    if (reachable.has(nodeName) || !model.nodes[nodeName]) {
      return;
    }

    reachable.add(nodeName);
    const node = model.nodes[nodeName];
    const dependencies = getNodeDependencies(node);

    for (const dep of dependencies) {
      dfs(dep);
    }
  }

  // Start DFS from the start node
  if (model.start && model.nodes[model.start]) {
    dfs(model.start);
  }

  // Find unreachable nodes
  const allNodes = Object.keys(model.nodes);
  return allNodes.filter(name => !reachable.has(name));
}
