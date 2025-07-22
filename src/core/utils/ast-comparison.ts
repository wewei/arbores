import type { SourceFileAST, ASTNode } from '../types';
import { getSyntaxKindName } from '../syntax-kind-names';
import * as ts from 'typescript';

/**
 * AST 位置信息，表示从根节点到某个节点的路径
 */
export type ASTLocation = string[];

/**
 * AST 比较结果
 */
export type ASTComparisonResult = 
  | { same: true }
  | { same: false; diverge: { left: ASTLocation; right: ASTLocation } };

/**
 * 深度优先前序遍历比较两个 AST 节点
 * 比较节点类型、文本内容和子节点递归，第一个差异时立即返回
 * 
 * @param leftNode - 左侧节点
 * @param rightNode - 右侧节点
 * @param leftNodes - 左侧 nodes map
 * @param rightNodes - 右侧 nodes map
 * @param leftPath - 左侧节点路径（从根到当前节点的 ID 列表）
 * @param rightPath - 右侧节点路径（从根到当前节点的 ID 列表）
 * @returns 比较结果
 */
export function compareASTNodes(
  leftNode: ASTNode,
  rightNode: ASTNode,
  leftNodes: Record<string, ASTNode>,
  rightNodes: Record<string, ASTNode>,
  leftPath: string[] = [leftNode.id],
  rightPath: string[] = [rightNode.id]
): ASTComparisonResult {
  
  // 1. 比较节点类型
  if (leftNode.kind !== rightNode.kind) {
    return {
      same: false,
      diverge: { left: leftPath, right: rightPath }
    };
  }

  // 2. 比较节点文本
  if (leftNode.text !== rightNode.text) {
    return {
      same: false,
      diverge: { left: leftPath, right: rightPath }
    };
  }

  // 3. 比较子节点数量
  const leftChildren = leftNode.children || [];
  const rightChildren = rightNode.children || [];
  
  if (leftChildren.length !== rightChildren.length) {
    return {
      same: false,
      diverge: { left: leftPath, right: rightPath }
    };
  }

  // 4. 深度优先前序遍历比较子节点
  for (let i = 0; i < leftChildren.length; i++) {
    const leftChildId = leftChildren[i];
    const rightChildId = rightChildren[i];
    
    if (!leftChildId || !rightChildId) {
      return {
        same: false,
        diverge: { left: leftPath, right: rightPath }
      };
    }
    
    const leftChild = leftNodes[leftChildId];
    const rightChild = rightNodes[rightChildId];
    
    if (!leftChild || !rightChild) {
      return {
        same: false,
        diverge: { left: leftPath, right: rightPath }
      };
    }
    
    // 构建子节点路径
    const leftChildPath = [...leftPath, leftChildId];
    const rightChildPath = [...rightPath, rightChildId];
    
    // 递归比较子节点
    const childResult = compareASTNodes(
      leftChild, 
      rightChild, 
      leftNodes, 
      rightNodes, 
      leftChildPath, 
      rightChildPath
    );
    
    if (!childResult.same) {
      return childResult;
    }
  }

  return { same: true };
}

/**
 * 比较两个完整的 SourceFileAST
 * 
 * @param leftAST - 左侧 AST
 * @param rightAST - 右侧 AST
 * @returns 比较结果
 */
export function compareSourceFileASTs(
  leftAST: SourceFileAST,
  rightAST: SourceFileAST
): ASTComparisonResult {
  // 获取根节点
  const leftRootId = leftAST.versions[0]?.root_node_id;
  const rightRootId = rightAST.versions[0]?.root_node_id;
  
  if (!leftRootId || !rightRootId) {
    return {
      same: false,
      diverge: { left: [], right: [] }
    };
  }
  
  const leftRoot = leftAST.nodes[leftRootId];
  const rightRoot = rightAST.nodes[rightRootId];
  
  if (!leftRoot || !rightRoot) {
    return {
      same: false,
      diverge: { left: [leftRootId], right: [rightRootId] }
    };
  }
  
  return compareASTNodes(
    leftRoot,
    rightRoot,
    leftAST.nodes,
    rightAST.nodes,
    [leftRootId],
    [rightRootId]
  );
}

/**
 * 格式化 AST 位置为可读字符串
 * 
 * @param location - AST 位置
 * @param nodes - nodes map
 * @returns 格式化的位置字符串
 */
export function formatASTLocation(
  location: ASTLocation,
  nodes: Record<string, ASTNode>
): string {
  if (location.length === 0) {
    return '<root>';
  }
  
  return location
    .map((nodeId, index) => {
      const node = nodes[nodeId];
      if (!node) {
        return `unknown[${nodeId}]`;
      }
      
      const kindName = getKindName(node.kind);
      const text = node.text ? ` "${node.text}"` : '';
      
      if (index === 0) {
        return `${kindName}${text}`;
      } else {
        return `→${kindName}${text}`;
      }
    })
    .join('');
}

/**
 * 获取 SyntaxKind 名称
 */
function getKindName(kind: number): string {
  return getSyntaxKindName(kind);
}

/**
 * 检查节点是否是可选的语法标点符号
 * 这些标点符号在 AST 比较时应该被忽略，因为它们在语法上是可选的
 */
function isOptionalPunctuation(node: ASTNode, parentNode?: ASTNode): boolean {
  const kind = node.kind;
  
  // 基础的分号和逗号 tokens
  if (kind === ts.SyntaxKind.SemicolonToken || kind === ts.SyntaxKind.CommaToken) {
    return true;
  }
  
  // 根据父节点上下文判断可选标点符号
  if (parentNode) {
    const parentKind = parentNode.kind;
    
    // MappedType 内的分号总是可选的
    if (parentKind === ts.SyntaxKind.MappedType && kind === ts.SyntaxKind.SemicolonToken) {
      return true;
    }
    
    // Block 末尾的分号
    if (parentKind === ts.SyntaxKind.Block && kind === ts.SyntaxKind.SemicolonToken) {
      return true;
    }
    
    // 参数列表、数组、对象末尾的逗号
    if (kind === ts.SyntaxKind.CommaToken) {
      if (parentKind === ts.SyntaxKind.Parameter ||
          parentKind === ts.SyntaxKind.CallExpression ||
          parentKind === ts.SyntaxKind.ArrayLiteralExpression ||
          parentKind === ts.SyntaxKind.ArrayBindingPattern ||
          parentKind === ts.SyntaxKind.ObjectLiteralExpression ||
          parentKind === ts.SyntaxKind.ObjectBindingPattern ||
          parentKind === ts.SyntaxKind.TupleType ||
          parentKind === ts.SyntaxKind.TypeReference ||
          parentKind === ts.SyntaxKind.TypeParameter) {
        return true;
      }
    }
    
    // Interface 和 Type literal 成员末尾的分号/逗号
    if ((kind === ts.SyntaxKind.SemicolonToken || kind === ts.SyntaxKind.CommaToken)) {
      if (parentKind === ts.SyntaxKind.InterfaceDeclaration ||
          parentKind === ts.SyntaxKind.TypeLiteral) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * 过滤掉可选标点符号的子节点列表
 * 
 * @param children - 原始子节点ID列表
 * @param nodes - nodes map
 * @param parentNode - 父节点（用于上下文判断）
 * @returns 过滤后的子节点ID列表
 */
function filterOptionalPunctuation(
  children: string[],
  nodes: Record<string, ASTNode>,
  parentNode?: ASTNode
): string[] {
  return children.filter(childId => {
    const childNode = nodes[childId];
    if (!childNode) return true; // 保留无效节点以便后续错误检测
    
    return !isOptionalPunctuation(childNode, parentNode);
  });
}

/**
 * 智能比较两个 AST 节点，忽略可选的语法标点符号
 * 比较节点类型、文本内容和子节点递归，第一个差异时立即返回
 * 
 * @param leftNode - 左侧节点
 * @param rightNode - 右侧节点
 * @param leftNodes - 左侧 nodes map
 * @param rightNodes - 右侧 nodes map
 * @param leftPath - 左侧节点路径（从根到当前节点的 ID 列表）
 * @param rightPath - 右侧节点路径（从根到当前节点的 ID 列表）
 * @returns 比较结果
 */
export function compareASTNodesIntelligent(
  leftNode: ASTNode,
  rightNode: ASTNode,
  leftNodes: Record<string, ASTNode>,
  rightNodes: Record<string, ASTNode>,
  leftPath: string[] = [leftNode.id],
  rightPath: string[] = [rightNode.id]
): ASTComparisonResult {
  
  // 特殊情况：如果一个是 ParenthesizedExpression，另一个不是，尝试比较 ParenthesizedExpression 的内容
  if (leftNode.kind === ts.SyntaxKind.ParenthesizedExpression && rightNode.kind !== ts.SyntaxKind.ParenthesizedExpression) {
    // 左边是括号表达式，右边不是，比较左边括号内的表达式和右边
    const leftChildren = leftNode.children || [];
    if (leftChildren.length >= 3 && leftChildren[1]) { // ParenthesizedExpression 结构: ( expression )
      const leftInnerNode = leftNodes[leftChildren[1]]; // 中间的表达式
      if (leftInnerNode) {
        return compareASTNodesIntelligent(
          leftInnerNode,
          rightNode,
          leftNodes,
          rightNodes,
          [...leftPath, leftChildren[1]],
          rightPath
        );
      }
    }
  }
  
  if (rightNode.kind === ts.SyntaxKind.ParenthesizedExpression && leftNode.kind !== ts.SyntaxKind.ParenthesizedExpression) {
    // 右边是括号表达式，左边不是，比较右边括号内的表达式和左边
    const rightChildren = rightNode.children || [];
    if (rightChildren.length >= 3 && rightChildren[1]) { // ParenthesizedExpression 结构: ( expression )
      const rightInnerNode = rightNodes[rightChildren[1]]; // 中间的表达式
      if (rightInnerNode) {
        return compareASTNodesIntelligent(
          leftNode,
          rightInnerNode,
          leftNodes,
          rightNodes,
          leftPath,
          [...rightPath, rightChildren[1]]
        );
      }
    }
  }
  
  // 1. 比较节点类型
  if (leftNode.kind !== rightNode.kind) {
    return {
      same: false,
      diverge: { left: leftPath, right: rightPath }
    };
  }

  // 2. 比较节点文本
  if (leftNode.text !== rightNode.text) {
    return {
      same: false,
      diverge: { left: leftPath, right: rightPath }
    };
  }

  // 3. 获取并过滤子节点，移除可选的标点符号
  const leftChildren = leftNode.children || [];
  const rightChildren = rightNode.children || [];
  
  const filteredLeftChildren = filterOptionalPunctuation(leftChildren, leftNodes, leftNode);
  const filteredRightChildren = filterOptionalPunctuation(rightChildren, rightNodes, rightNode);
  
  // 4. 比较过滤后的子节点数量
  if (filteredLeftChildren.length !== filteredRightChildren.length) {
    return {
      same: false,
      diverge: { left: leftPath, right: rightPath }
    };
  }

  // 5. 深度优先前序遍历比较过滤后的子节点
  for (let i = 0; i < filteredLeftChildren.length; i++) {
    const leftChildId = filteredLeftChildren[i];
    const rightChildId = filteredRightChildren[i];
    
    if (!leftChildId || !rightChildId) {
      return {
        same: false,
        diverge: { left: leftPath, right: rightPath }
      };
    }
    
    const leftChild = leftNodes[leftChildId];
    const rightChild = rightNodes[rightChildId];
    
    if (!leftChild || !rightChild) {
      return {
        same: false,
        diverge: { left: leftPath, right: rightPath }
      };
    }
    
    // 构建子节点路径
    const leftChildPath = [...leftPath, leftChildId];
    const rightChildPath = [...rightPath, rightChildId];
    
    // 递归比较子节点（使用智能比较）
    const childResult = compareASTNodesIntelligent(
      leftChild, 
      rightChild, 
      leftNodes, 
      rightNodes, 
      leftChildPath, 
      rightChildPath
    );
    
    if (!childResult.same) {
      return childResult;
    }
  }

  return { same: true };
}

/**
 * 智能比较两个完整的 SourceFileAST，忽略可选的语法标点符号
 * 
 * @param leftAST - 左侧 AST
 * @param rightAST - 右侧 AST
 * @returns 比较结果
 */
export function compareSourceFileASTsIntelligent(
  leftAST: SourceFileAST,
  rightAST: SourceFileAST
): ASTComparisonResult {
  // 获取根节点
  const leftRootId = leftAST.versions[0]?.root_node_id;
  const rightRootId = rightAST.versions[0]?.root_node_id;
  
  if (!leftRootId || !rightRootId) {
    return {
      same: false,
      diverge: { left: [], right: [] }
    };
  }
  
  const leftRoot = leftAST.nodes[leftRootId];
  const rightRoot = rightAST.nodes[rightRootId];
  
  if (!leftRoot || !rightRoot) {
    return {
      same: false,
      diverge: { left: [leftRootId], right: [rightRootId] }
    };
  }
  
  return compareASTNodesIntelligent(
    leftRoot,
    rightRoot,
    leftAST.nodes,
    rightAST.nodes,
    [leftRootId],
    [rightRootId]
  );
}
