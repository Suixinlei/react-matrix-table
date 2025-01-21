/* eslint-disable for-direction */
/**
 * 将叶子数量反向获取到上级节点中
 * 复杂度 2 * N^2
 */
function reverseLfsLeafCount(levelNodes: any[]) {
  const leafNodeCountMap: Record<string, number> = {};

  // 数组倒置循环
  for (let i = levelNodes.length - 1; i >= 0; i--) {
    const levelLength = levelNodes[i].length;
    for (let j = 0; j < levelLength; j++) {
      const currentItem = levelNodes[i][j];
      const parentIndex = currentItem.parent;
      // 只有子层级计数
      if (parentIndex) {
        if (!leafNodeCountMap[parentIndex]) {
          leafNodeCountMap[parentIndex] = 0;
        }
        if (leafNodeCountMap[currentItem.dataColIndex]) {
          leafNodeCountMap[parentIndex] +=
            leafNodeCountMap[currentItem.dataColIndex];
        } else {
          leafNodeCountMap[parentIndex] += 1;
        }
      }
    }
  }
  // 设置 dataColIndex 和 startIndex 的对应关系
  const dataIndex2StartIndexMap = {};
  // 将 leafNodeCountMap 设置到 levelNodes 中
  let firstLevelStartIndex = 1;
  // 第一层级，必定为 父层级
  for (let j = 0; j < levelNodes[0].length; j++) {
    const currentItem = levelNodes[0][j];
    const leafCount = leafNodeCountMap[currentItem.dataColIndex];
    if (leafCount) {
      levelNodes[0][j].leafCount = leafCount;
      levelNodes[0][j].startIndex = firstLevelStartIndex;
      // 下个 node
      firstLevelStartIndex += leafCount;
    } else {
      levelNodes[0][j].leafCount = 1;
      levelNodes[0][j].startIndex = firstLevelStartIndex;
      // 下个 node
      firstLevelStartIndex += 1;
    }

    dataIndex2StartIndexMap[levelNodes[0][j].dataColIndex] = {
      startIndex: levelNodes[0][j].startIndex,
      nextItemStartOffset: 0,
    };
  }

  // 第二到第 N 层级
  for (let i = 1; i < levelNodes.length; i++) {
    for (let j = 0; j < levelNodes[i].length; j++) {
      const currentItem = levelNodes[i][j];
      const leafCount = leafNodeCountMap[currentItem.dataColIndex];
      const parentIndex = dataIndex2StartIndexMap[levelNodes[i][j].parent];
      if (leafCount) {
        levelNodes[i][j].leafCount = leafCount;
      } else {
        levelNodes[i][j].leafCount = 1;
      }

      levelNodes[i][j].startIndex =
        parentIndex.startIndex + parentIndex.nextItemStartOffset;
      // 下个 node
      dataIndex2StartIndexMap[levelNodes[i][j].parent].nextItemStartOffset +=
        levelNodes[i][j].leafCount;

      // 设置 map
      dataIndex2StartIndexMap[levelNodes[i][j].dataColIndex] = {
        startIndex: levelNodes[i][j].startIndex,
        nextItemStartOffset: 0,
      };
    }
  }

  return levelNodes;
}

export default reverseLfsLeafCount;
