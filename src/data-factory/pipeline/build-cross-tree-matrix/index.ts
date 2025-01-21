import omit from 'lodash/omit';
import { transformTreeToFlatten } from '@/data-factory/utils/transformTreeToFlatten';
import { pruningTreeWithExpand } from '../pruning-tree-with-expand';
import getTreeDepth from './get-tree-depth';
import reverseLfsLeafCount from './reverse-lfs-leaf-count';

export function buildCrossTreeMatrix(
  rowTree,
  colTree,
  expandedRowIndex,
  expandedColIndex,
  hashDataMap,
  hashNumberFormatMap,
  cornerName?: string,
) {
  console.log('-----------cross tree matrix training start---------------');
  const renderColTree = pruningTreeWithExpand(colTree, expandedColIndex);
  const renderRowTree = pruningTreeWithExpand(rowTree, expandedRowIndex);
  const renderFlattenRowArr = transformTreeToFlatten(renderRowTree);

  const { maxDepth, levelNodes, leafNodeCount } = getTreeDepth(renderColTree);
  const newLevelNodes = reverseLfsLeafCount(levelNodes);

  // 初始化数组
  const rowLength = renderFlattenRowArr.length + maxDepth + 1;
  const colLength = leafNodeCount + 1;
  // 设置矩阵有多少行
  const matrix = new Array(rowLength);
  for (let i = 0; i < matrix.length; i++) {
    // 设置矩阵有多少列
    matrix[i] = new Array(colLength);
  }

  const renderCol = (rowIndex: number, colIndex: number) => {
    const currentLevel = rowIndex;

    let resultFindIndex = newLevelNodes[currentLevel].length - 1;
    while (
      newLevelNodes[currentLevel][resultFindIndex]?.startIndex > colIndex
    ) {
      resultFindIndex = resultFindIndex - 1;
    }

    let endIndex;
    if (newLevelNodes[currentLevel][resultFindIndex + 1]?.startIndex) {
      endIndex = newLevelNodes[currentLevel][resultFindIndex + 1]?.startIndex;
    } else {
      endIndex =
        Number(newLevelNodes[currentLevel][resultFindIndex].startIndex) +
        Number(newLevelNodes[currentLevel][resultFindIndex].leafCount) -
        1;
    }
    // 返回找到的 node
    return {
      ...newLevelNodes[currentLevel][resultFindIndex],
      endIndex,
    };
  };

  for (let rowIndex = 0; rowIndex < rowLength; rowIndex++) {
    for (let colIndex = 0; colIndex < colLength; colIndex++) {
      // corner
      if (colIndex === 0 && rowIndex <= maxDepth) {
        matrix[rowIndex][colIndex] = {
          id: 'corner',
          colIndex,
          rowIndex,
          payload: { name: cornerName },
          rowSpan: maxDepth + 1,
          colSpan: 1,
        };
      } else if (colIndex === 0) {
        // 左树
        matrix[rowIndex][colIndex] = {
          colIndex,
          rowIndex,
          type: 'rowHeader',
          ...renderFlattenRowArr[rowIndex - (maxDepth + 1)],
          payload: {},
        };
      } else if (rowIndex <= maxDepth) {
        // 上展开列头
        if (matrix[rowIndex - 1]?.[colIndex]?.isLeaf) {
          // 本列上一行是叶子的情况下，直接返回上一列用做聚合
          matrix[rowIndex][colIndex] = omit(
            matrix[rowIndex - 1][colIndex],
            ['rowIndex'],
          );
        } else {
          const renderColHeader = renderCol(rowIndex, colIndex);
          matrix[rowIndex][colIndex] = {
            ...renderColHeader,
            colIndex,
            rowIndex,
            type: 'colHeader',
            colSpan: renderColHeader.leafCount,
            rowSpan: renderColHeader.isLeaf ? maxDepth + 1 - rowIndex : 1,
          };
        }
      } else {
        const { dataColIndex } = matrix[maxDepth][colIndex];
        const { dataRowIndex } = matrix[rowIndex][0];
        const hashIndex = `${dataColIndex}:${dataRowIndex}`;
        // 单元格
        matrix[rowIndex][colIndex] = {
          colIndex,
          rowIndex,
          type: 'cell',
          payload: hashDataMap[hashIndex],
          numberFormat: hashNumberFormatMap[hashIndex],
        };
      }
    }
  }

  return {
    matrixData: matrix,
    colHeaderLength: maxDepth + 1,
  };
}
