import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

import { pruningTreeWithExpand } from './pipeline/pruning-tree-with-expand';
import { transformArrayDataToHashMap } from './pipeline/transform-array-data-to-hash-map';
import { initialTransformFlattenToTree } from './pipeline/initial-transform-flatten-to-tree';
import { collectAllNumberFormat } from './pipeline/collect-all-number-format';
import { buildCrossTreeMatrix } from './pipeline/build-cross-tree-matrix';

import { collectDefaultExpandToArr } from './utils/collectDefaultExpandToArr';
import { transformTreeToFlatten } from './utils/transformTreeToFlatten';

import type { IColTreeItem, IRowTreeItem, INumberFormatConfig } from './types';

export interface OriginalRowHeaderProps {
  id: string;
  name: string;
  level: number;
  dataRowIndex: number;
  defaultExpand: boolean;
  defaultDisplay: boolean;
  parent: string;

  format: string;
  unit: string;
  // original style
  numberStyle: string;
  valueType: string;
}

export interface OriginalColHeaderProps {
  id: string;
  name: string;
  level: number;
  unit: string;
  dataColIndex: string;
  defaultExpand: boolean;
  defaultDisplay: boolean;
  parent: string;
  format: string;
  numberStyle: string;
  valueType: string;
  // 条件格式
  condition: Record<string, any>;
}

export interface DataFactoryOptions {
  colHeaders: OriginalColHeaderProps[];
  rowHeaders: OriginalRowHeaderProps[];
  cornerName?: string;
}

interface OriginalDataProps {
  // 数据行坐标
  rowIndex: string;
  // 数据列坐标
  colIndex: string;
  // 数值
  itemNumber: number;
}

export class DataFactory {
  // 处理后的数据 (树形)
  private rowTree: IRowTreeItem[] = [];

  // 处理后的数据 (树形)
  private colTree: IColTreeItem[] = [];

  // 哈希数据集
  private hashDataMap: Record<string, any> = {};

  // 哈希行列维格式
  private hashNumberFormatMap: Record<string, INumberFormatConfig> = {};

  // 展开的行, 保存 dataRowIndex
  private expandedRowIndex: Array<string | number> = [];

  // 展开的列, 保存 dataColIndex
  private expandedColIndex: Array<string | number> = [];

  // 所有可展开行的 index
  private allExpandedRowIndex: Array<string | number> = [];

  // 所有可展开列的 index
  private allExpandedColIndex: Array<string | number> = [];

  // 角标名称
  private cornerName = '';

  constructor(options: DataFactoryOptions) {
    this.rowTree = initialTransformFlattenToTree(options.rowHeaders);
    this.colTree = initialTransformFlattenToTree(options.colHeaders);
    // 获取行的默认展开 index 和全部可展开的 index
    this.expandedRowIndex = collectDefaultExpandToArr(this.rowTree);
    this.allExpandedRowIndex = collectDefaultExpandToArr(this.rowTree, true);
    // 获取列的默认展开 index 和全部可展开的 index
    this.expandedColIndex = collectDefaultExpandToArr(this.colTree);
    this.allExpandedColIndex = collectDefaultExpandToArr(this.colTree, true);

    // 处理获取全部的值格式
    this.hashNumberFormatMap = collectAllNumberFormat(
      this.rowTree,
      this.colTree,
    );

    this.cornerName = options.cornerName || '';
  }

  updateDS(dataSource) {
    if (Array.isArray(dataSource)) {
      this.hashDataMap = transformArrayDataToHashMap(dataSource);
    }
  }

  // 展开列
  onExpandCol = (dataColIndex: string) => {
    if (this.allExpandedColIndex.includes(dataColIndex)) {
      const idx = this.expandedColIndex.indexOf(dataColIndex);
      if (idx === -1) {
        this.expandedColIndex = [...this.expandedColIndex, dataColIndex];
      } else {
        this.expandedColIndex.splice(idx, 1);
      }
    }
  };

  // 展开行
  onExpandRow = (dataRowIndex: string) => {
    const idx = this.expandedRowIndex.indexOf(dataRowIndex);
    if (idx === -1) {
      this.expandedRowIndex = [...this.expandedRowIndex, dataRowIndex];
    } else {
      this.expandedRowIndex.splice(idx, 1);
    }
  };

  // 展开全部，如果已经是全部则收起
  onExpandAll() {
    if (
      isEqual(this.expandedColIndex, this.allExpandedColIndex) &&
      isEqual(this.expandedRowIndex, this.allExpandedRowIndex)
    ) {
      this.expandedColIndex = [];
      this.expandedRowIndex = [];
    } else {
      this.expandedColIndex = cloneDeep(this.allExpandedColIndex);
      this.expandedRowIndex = cloneDeep(this.allExpandedRowIndex);
    }
  }

  getExpandedRowIndex() {
    return this.expandedRowIndex;
  }

  getExpandedColIndex() {
    return this.expandedColIndex;
  }

  // 经过交互命令等之后剪裁产生的树, 向右展开
  getFlattenExpandMatrix() {
    const renderFlattenRowArr = transformTreeToFlatten(
      pruningTreeWithExpand(this.rowTree, this.expandedRowIndex),
    );
    const renderFlattenColArr = transformTreeToFlatten(
      pruningTreeWithExpand(this.colTree, this.expandedColIndex),
    );

    // 初始化数组
    const matrix = new Array(renderFlattenRowArr.length + 1);
    for (let i = 0; i < matrix.length; i++) {
      matrix[i] = new Array(renderFlattenColArr.length + 1);
    }

    // 行列展开, colIndex 和 rowIndex 全部为渲染坐标
    for (let rowIndex = 0; rowIndex <= renderFlattenRowArr.length; rowIndex++) {
      for (
        let colIndex = 0;
        colIndex <= renderFlattenColArr.length;
        colIndex++
      ) {
        // corner
        if (rowIndex === 0 && colIndex === 0) {
          matrix[rowIndex][colIndex] = {
            colIndex,
            rowIndex,
            payload: { name: this.cornerName },
          };
        } else if (colIndex === 0) {
          matrix[rowIndex][colIndex] = {
            colIndex,
            rowIndex,
            type: 'rowHeader',
            ...renderFlattenRowArr[rowIndex - 1],
            payload: {},
          };
        } else if (rowIndex === 0) {
          matrix[rowIndex][colIndex] = {
            colIndex,
            rowIndex,
            type: 'colHeader',
            ...renderFlattenColArr[colIndex - 1],
            payload: {},
          };
        } else {
          const { dataColIndex } = renderFlattenColArr[colIndex - 1];
          const { dataRowIndex } = renderFlattenRowArr[rowIndex - 1];

          const hashIndex = `${dataColIndex}:${dataRowIndex}`;

          matrix[rowIndex][colIndex] = {
            colIndex,
            rowIndex,
            id: `${colIndex}-${rowIndex}`,
            type: 'cell',
            dataColIndex,
            dataRowIndex,
            numberFormat: this.hashNumberFormatMap[hashIndex],
            payload: this.hashDataMap[hashIndex],
          };
        }
      }
    }

    return matrix;
  }

  // 经过交互命令等之后剪裁产生的树，向下展开
  getTreeExpandMatrix() {
    // 需要的几个要素：最大层级，每个树下方最大叶子数量和
    // 处理顺序 列 -》 行 -》 单元格
    return buildCrossTreeMatrix(
      this.rowTree,
      this.colTree,
      this.expandedRowIndex,
      this.expandedColIndex,
      this.hashDataMap,
      this.hashNumberFormatMap,
      this.cornerName,
    );
  }
}
