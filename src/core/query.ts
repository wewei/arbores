/**
 * Arbores Query API
 * 
 * This module provides functionality to query and navigate AST structures.
 * All functions follow the functional, stateless API design with Result<T> return types.
 */

import { success, error, type Result, ArborError } from './types';
import type { SourceFileAST, ASTNode, FileVersion } from './types';
import * as ts from 'typescript';
import { getSyntaxKindName } from './syntax-kind-names';

/**
 * Get all version information from AST
 * @param ast - The AST data structure
 * @returns Result containing array of version information
 */
export function getRoots(ast: SourceFileAST): Result<FileVersion[]> {
  try {
    if (!ast.versions || !Array.isArray(ast.versions)) {
      return error('INVALID_AST_STRUCTURE', 'AST versions field is missing or invalid');
    }

    const versions = [...ast.versions]; // Create a copy to avoid mutation
    return success(versions);
  } catch (e) {
    return error('INVALID_AST_STRUCTURE', `Failed to extract version information: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

/**
 * Get specific node information by ID
 * @param ast - The AST data structure  
 * @param nodeId - The node ID to retrieve
 * @returns Result containing node information
 */
export function getNode(ast: SourceFileAST, nodeId: string): Result<ASTNode> {
  try {
    if (!ast.nodes) {
      return error('INVALID_AST_STRUCTURE', 'AST nodes field is missing');
    }

    const astNode = ast.nodes[nodeId];
    if (!astNode) {
      return error('NODE_NOT_FOUND', `Node with ID '${nodeId}' not found`);
    }

    // Return a copy to avoid mutations
    const nodeCopy: ASTNode = {
      ...astNode,
      children: astNode.children ? [...astNode.children] : undefined,
      properties: astNode.properties ? { ...astNode.properties } : undefined,
      leadingComments: astNode.leadingComments ? [...astNode.leadingComments] : undefined,
      trailingComments: astNode.trailingComments ? [...astNode.trailingComments] : undefined
    };
    
    return success(nodeCopy);
  } catch (e) {
    return error('INVALID_AST_STRUCTURE', `Failed to retrieve node: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

/**
 * Get all direct children of a specific node
 * @param ast - The AST data structure
 * @param nodeId - The parent node ID
 * @returns Result containing array of child node information
 */
export function getChildren(ast: SourceFileAST, nodeId: string): Result<ASTNode[]> {
  try {
    if (!ast.nodes) {
      return error('INVALID_AST_STRUCTURE', 'AST nodes field is missing');
    }

    const parentNode = ast.nodes[nodeId];
    if (!parentNode) {
      return error('NODE_NOT_FOUND', `Parent node with ID '${nodeId}' not found`);
    }

    // If no children, return empty array
    if (!parentNode.children || parentNode.children.length === 0) {
      return success([]);
    }

    // Convert each child node to a copy
    const children: ASTNode[] = [];
    for (const childId of parentNode.children) {
      const childNode = ast.nodes[childId];
      if (childNode) {
        const childCopy: ASTNode = {
          ...childNode,
          children: childNode.children ? [...childNode.children] : undefined,
          properties: childNode.properties ? { ...childNode.properties } : undefined,
          leadingComments: childNode.leadingComments ? [...childNode.leadingComments] : undefined,
          trailingComments: childNode.trailingComments ? [...childNode.trailingComments] : undefined
        };
        children.push(childCopy);
      } else {
        // Handle missing child node (broken reference)
        return error('INVALID_AST_STRUCTURE', `Child node '${childId}' referenced by '${nodeId}' not found`);
      }
    }

    return success(children);
  } catch (e) {
    return error('INVALID_AST_STRUCTURE', `Failed to retrieve children: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

/**
 * Get parent chain for a specific node (from direct parent to root)
 * @param ast - The AST data structure
 * @param nodeId - The child node ID
 * @returns Result containing array of parent node information (ordered from direct parent to root)
 */
export function getParents(ast: SourceFileAST, nodeId: string): Result<ASTNode[]> {
  try {
    if (!ast.nodes) {
      return error('INVALID_AST_STRUCTURE', 'AST nodes field is missing');
    }

    const targetNode = ast.nodes[nodeId];
    if (!targetNode) {
      return error('NODE_NOT_FOUND', `Target node with ID '${nodeId}' not found`);
    }

    const parents: ASTNode[] = [];
    
    // Search for nodes that contain the target node as a child
    for (const candidateId in ast.nodes) {
      const candidateNode = ast.nodes[candidateId];
      if (candidateNode && candidateNode.children && candidateNode.children.includes(nodeId)) {
        // Found a parent, create a copy
        const parentCopy: ASTNode = {
          id: candidateNode.id,
          kind: candidateNode.kind,
          text: candidateNode.text,
          children: candidateNode.children ? [...candidateNode.children] : undefined,
          properties: candidateNode.properties ? { ...candidateNode.properties } : undefined,
          leadingComments: candidateNode.leadingComments ? [...candidateNode.leadingComments] : undefined,
          trailingComments: candidateNode.trailingComments ? [...candidateNode.trailingComments] : undefined
        };
        
        parents.push(parentCopy);
        
        // Recursively get parents of this parent
        const grandParents = getParents(ast, candidateId);
        if (grandParents.success) {
          parents.push(...grandParents.data);
        }
        break; // Assuming each node has at most one parent
      }
    }

    return success(parents);
  } catch (e) {
    return error('INVALID_AST_STRUCTURE', `Failed to retrieve parents: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

/**
 * Get the latest root node from the AST
 * @param ast - The AST data structure
 * @returns Result containing the latest root node information
 */
export function getLatestRoot(ast: SourceFileAST): Result<ASTNode> {
  try {
    if (!ast.versions || ast.versions.length === 0) {
      return error('INVALID_AST_STRUCTURE', 'No versions found in AST');
    }

    const latestVersion = ast.versions[ast.versions.length - 1];
    if (!latestVersion || !latestVersion.root_node_id) {
      return error('INVALID_AST_STRUCTURE', 'Latest version has no root node ID');
    }

    return getNode(ast, latestVersion.root_node_id);
  } catch (e) {
    return error('INVALID_AST_STRUCTURE', `Failed to get latest root: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

/**
 * Get a node with its syntax kind name included
 * @param ast - The AST data structure
 * @param nodeId - The node ID to retrieve
 * @returns Result containing node information with kind name
 */
export function getNodeWithKindName(ast: SourceFileAST, nodeId: string): Result<ASTNode & { kindName: string }> {
  const nodeResult = getNode(ast, nodeId);
  if (!nodeResult.success) {
    return nodeResult;
  }

  const node = nodeResult.data;
  const kindName = getSyntaxKindName(node.kind);
  
  return success({
    ...node,
    kindName
  });
}

/**
 * Validate AST structure for basic integrity
 * @param ast - The AST to validate
 * @returns Result indicating validation success or failure
 */
export function validateAST(ast: SourceFileAST): Result<boolean> {
  try {
    // Check basic structure
    if (!ast || typeof ast !== 'object') {
      return error('INVALID_AST_STRUCTURE', 'AST is not an object');
    }

    if (!ast.nodes || typeof ast.nodes !== 'object') {
      return error('INVALID_AST_STRUCTURE', 'AST nodes field is missing or invalid');
    }

    if (!ast.versions || !Array.isArray(ast.versions)) {
      return error('INVALID_AST_STRUCTURE', 'AST versions field is missing or invalid');
    }

    // Check node references
    for (const nodeId in ast.nodes) {
      const node = ast.nodes[nodeId];
      if (node && node.children) {
        for (const childId of node.children) {
          if (!ast.nodes[childId]) {
            return error('INVALID_AST_STRUCTURE', `Node '${nodeId}' references missing child '${childId}'`);
          }
        }
      }
    }

    // Check version root nodes exist
    for (const version of ast.versions) {
      if (!ast.nodes[version.root_node_id]) {
        return error('INVALID_AST_STRUCTURE', `Version references missing root node '${version.root_node_id}'`);
      }
    }

    return success(true);
  } catch (e) {
    return error('INVALID_AST_STRUCTURE', `AST validation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}
