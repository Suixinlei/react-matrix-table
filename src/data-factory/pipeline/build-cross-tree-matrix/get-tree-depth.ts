import type { AbstractTreeNode } from './types';
import isLeafNode from './is-leaf-node';

/**
 * DFS 搜索获取树最大深度
 */
function getTreeDepthAndLevelNodes(nodes: AbstractTreeNode[]) {
  let maxDepth = -1;
  let leafNodeCount = 0;
  // 双层数组，数组的第一层 index 是层级，第二层是对应层级的 nodes
  const levelNodes: any[] = [];
  dfs(nodes, 0);

  return {
    maxDepth,
    leafNodeCount,
    levelNodes,
  };

  function dfs(columns: AbstractTreeNode[], depth: number) {
    if (!levelNodes[depth]) {
      levelNodes[depth] = [];
    }

    for (const column of columns) {
      // 是叶子节点吗?
      if (isLeafNode(column)) {
        maxDepth = Math.max(maxDepth, depth);
        leafNodeCount = leafNodeCount + 1;
        levelNodes[depth].push({
          ...column,
          isLeaf: true,
        });
      } else {
        levelNodes[depth].push({
          ...column,
          isLeaf: false,
        });
        dfs(column.children, depth + 1);
      }
    }
  }
}

export default getTreeDepthAndLevelNodes;
