import { isNil, get } from 'lodash';
import {
  MatrixData,
  IndexMap,
  CustomLengthMap,
  MatrixPartition,
  RowHeaderConfig,
  RowFooterConfig,
  ColHeaderConfig,
  ColFooterConfig,
  DataAreaConfig,
  FixedConfig,
} from '../types';
import { MatrixContentSizeProps } from '../MatrixTable/types';

export const cacheCustomWidth = (
  data: MatrixData,
  dataColumnIndex2LeftMap,
  cellWidth,
  rowHeaderConfig,
  rowFooterConfig,
): CustomLengthMap => {
  const customWidthMap: CustomLengthMap = {};
  let preColCell = null;
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) {
    return customWidthMap;
  }
  const headerLength = rowHeaderConfig?.length ?? 0;
  const footerLength = rowFooterConfig?.length ?? 0;
  const colCount = data[0]?.length ?? 0;
  // eslint-disable-next-line no-unused-expressions
  data[0]?.forEach((col, index) => {
    const { width } = col;
    const { width: preColWidth } = preColCell || {};

    const shouldReset =
      index === 0 || // 第一列
      index === headerLength || // colHeader第一列
      index === colCount - footerLength; // corner top right第一列
    if (shouldReset) {
      dataColumnIndex2LeftMap[index] = 0;
    } else {
      dataColumnIndex2LeftMap[index] =
        dataColumnIndex2LeftMap[index - 1] + (preColWidth || cellWidth);
    }

    if (!isNil(width)) {
      customWidthMap[index] = width;
    }
    preColCell = col;
  });
  return customWidthMap;
};

// 用于处理单元格 top
export const cacheCustomHeight = (
  data: MatrixData,
  dataRowIndex2TopMap,
  cellHeight,
  colHeaderConfig,
  colFooterConfig,
): CustomLengthMap => {
  const customHeightMap: CustomLengthMap = {};
  let preRowCell = null;

  const colHeaderCellHeight = colHeaderConfig?.cellHeight ?? cellHeight;

  const headerLength = colHeaderConfig?.length ?? 0;
  const footerLength = colFooterConfig?.length ?? 0;
  const rowCount = data?.length ?? 0;

  // eslint-disable-next-line no-unused-expressions
  data?.forEach((row, index) => {
    const { height } = row[0] || {};
    const { height: preRowHeight } = preRowCell || {};

    const shouldReset =
      index === 0 || // 第一行
      index === headerLength || // rowHeader第一行
      index === rowCount - footerLength; // corner bottom left第一行

    if (shouldReset) {
      dataRowIndex2TopMap[index] = 0;
    } else {
      let preRowTop = dataRowIndex2TopMap[index - 1];
      if (index < headerLength) {
        dataRowIndex2TopMap[index] =
          preRowTop + (preRowHeight || colHeaderCellHeight);
      } else {
        dataRowIndex2TopMap[index] = preRowTop + (preRowHeight || cellHeight);
      }
    }

    if (!isNil(height)) {
      customHeightMap[index] = height;
    }

    preRowCell = row[0];
  });
  return customHeightMap;
};

export interface CalcSizeOptions {
  dataAreaPartition: IndexMap;
  customWidthMap: CustomLengthMap;
  customHeightMap: CustomLengthMap;
  cellWidth: number;
  cellHeight: number;
  rowHeaderConfig: RowHeaderConfig;
  rowFooterConfig: RowFooterConfig;
  colHeaderConfig: ColHeaderConfig;
  colFooterConfig: ColFooterConfig;
}

export const calculateContentSize = (
  options: CalcSizeOptions,
): MatrixContentSizeProps => {
  const {
    dataAreaPartition,
    cellWidth,
    cellHeight,
    customWidthMap,
    customHeightMap,
    rowHeaderConfig,
    rowFooterConfig,
    colHeaderConfig,
    colFooterConfig,
  } = options;
  const { rowStartIndex, rowEndIndex, colStartIndex, colEndIndex } =
    dataAreaPartition;
  const {
    length: rowHeaderLength = 0,
    cellWidth: rowHeaderCellWidth = cellWidth,
  } = rowHeaderConfig || {};
  const {
    length: rowFooterLength = 0,
    cellWidth: rowFooterCellWidth = cellWidth,
  } = rowFooterConfig || {};
  const {
    length: colHeaderLength = 0,
    cellHeight: colHeaderCellHeight = cellHeight,
  } = colHeaderConfig || {};
  const {
    length: colFooterLength = 0,
    cellHeight: colFooterCellHeight = cellHeight,
  } = colFooterConfig || {};

  const contentHeight =
    colHeaderLength * colHeaderCellHeight +
    colFooterLength * colFooterCellHeight +
    (rowEndIndex - rowStartIndex) * cellHeight;
  const contentWidth =
    rowHeaderLength * rowHeaderCellWidth +
    rowFooterLength * rowFooterCellWidth +
    (colEndIndex - colStartIndex) * cellWidth;

  let patchWidth = 0;
  Object.keys(customWidthMap).forEach((key) => {
    const colIndex = +key;
    const width = customWidthMap[colIndex];
    if (colIndex < colStartIndex) {
      patchWidth += -rowHeaderCellWidth + width;
    } else if (colIndex >= colEndIndex) {
      patchWidth += -rowFooterCellWidth + width;
    } else {
      patchWidth += -cellWidth + width;
    }
  });

  let patchHeight = 0;
  Object.keys(customHeightMap).forEach((key) => {
    const rowIndex = +key;
    const height = customHeightMap[rowIndex];
    if (rowIndex < rowStartIndex) {
      patchHeight += -colHeaderCellHeight + height;
    } else if (rowIndex >= rowEndIndex) {
      patchHeight += -colFooterCellHeight + height;
    } else {
      patchHeight += -cellHeight + height;
    }
  });

  return {
    contentHeight: contentHeight + patchHeight,
    contentWidth: contentWidth + patchWidth,
  };
};

export const calcExpandRowIndexMap = (
  data: MatrixData,
  defaultExpandAllRows: boolean,
): Record<string | number, boolean> => {
  const expandRowIndexMap = {};
  if (defaultExpandAllRows) {
    for (let i = 0; i < data.length; i++) {
      if (get(data, `${i + 1}.[0].level`, 1) > get(data, `${i}.[0].level`, 1)) {
        data[i][0].isExpand = true;
        expandRowIndexMap[i] = true;
      }
    }
  }
  return expandRowIndexMap;
};

export const filterExpandedRows = (
  data: MatrixData,
  expandRowIndexMap: Record<string | number, boolean>,
  baseLevel: number,
  useAll?: boolean,
): MatrixData => {
  if (useAll) {
    return data;
  }
  const result: MatrixData = [];
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    data[rowIndex][0].isExpand = expandRowIndexMap[rowIndex];
    result.push(data[rowIndex]);
    const curLevel = data[rowIndex][0].level ?? baseLevel;
    if (
      data[rowIndex + 1]?.[0].level > curLevel &&
      !expandRowIndexMap[rowIndex]
    ) {
      // is parent && collapsed
      while (data[rowIndex + 1]?.[0].level > curLevel) {
        rowIndex += 1;
      }
    }
  }
  return result;
};

export const isValidArea = (partition): boolean => {
  const { colEndIndex, colStartIndex, rowEndIndex, rowStartIndex } = partition;
  return colEndIndex > colStartIndex || rowEndIndex > rowStartIndex;
};

/**
 *  1 |    2    | 3
 * ------------------
 *    |         |
 *  4 |    5    | 6
 *    |         |
 * ------------------
 *  7 |    8    | 9
 *
 * 矩阵分区
 */
export const partition = (
  data: MatrixData,
  rowHeaderConfig: RowHeaderConfig,
  rowFooterConfig: RowFooterConfig,
  colHeaderConfig: ColHeaderConfig,
  colFooterConfig: ColFooterConfig,
): MatrixPartition => {
  const { length: rowHeaderLength = 0 } = rowHeaderConfig || {};
  const { length: rowFooterLength = 0 } = rowFooterConfig || {};
  const { length: colHeaderLength = 0 } = colHeaderConfig || {};
  const { length: colFooterLength = 0 } = colFooterConfig || {};

  const totalRows = data.length ?? 0;
  const totalCols = data[0]?.length ?? 0;

  // area 1
  const cornerTopLeft: IndexMap = {
    rowStartIndex: 0,
    rowEndIndex: colHeaderLength,
    colStartIndex: 0,
    colEndIndex: rowHeaderLength,
  };
  // area 2
  const colHeader: IndexMap = {
    rowStartIndex: 0,
    rowEndIndex: colHeaderLength,
    colStartIndex: rowHeaderLength,
    colEndIndex: totalCols - rowFooterLength,
  };
  // area 3
  const cornerTopRight: IndexMap = {
    rowStartIndex: 0,
    rowEndIndex: colHeaderLength,
    colStartIndex: totalCols - rowFooterLength,
    colEndIndex: totalCols,
  };
  // area 4
  const rowHeader: IndexMap = {
    rowStartIndex: colHeaderLength,
    rowEndIndex: totalRows - colFooterLength,
    colStartIndex: 0,
    colEndIndex: rowHeaderLength,
  };
  // area 5
  const dataArea: IndexMap = {
    rowStartIndex: colHeaderLength,
    rowEndIndex: totalRows - colFooterLength,
    colStartIndex: rowHeaderLength,
    colEndIndex: totalCols - rowFooterLength,
  };
  // area 6
  const rowFooter: IndexMap = {
    rowStartIndex: colHeaderLength,
    rowEndIndex: totalRows - colFooterLength,
    colStartIndex: totalCols - rowFooterLength,
    colEndIndex: totalCols,
  };
  // area 7
  const cornerBottomLeft: IndexMap = {
    rowStartIndex: totalRows - colFooterLength,
    rowEndIndex: totalRows,
    colStartIndex: 0,
    colEndIndex: rowHeaderLength,
  };
  // area 8
  const colFooter: IndexMap = {
    rowStartIndex: totalRows - colFooterLength,
    rowEndIndex: totalRows,
    colStartIndex: rowHeaderLength,
    colEndIndex: totalCols - rowFooterLength,
  };
  // area 9
  const cornerBottomRight: IndexMap = {
    rowStartIndex: totalRows - colFooterLength,
    rowEndIndex: totalRows,
    colStartIndex: totalCols - rowFooterLength,
    colEndIndex: totalCols,
  };

  return {
    cornerTopLeft,
    colHeader,
    cornerTopRight,
    rowHeader,
    dataArea,
    rowFooter,
    cornerBottomLeft,
    colFooter,
    cornerBottomRight,
  };
};

export interface calcFixedOption {
  rowHeaderConfig: RowHeaderConfig;
  rowFooterConfig: RowFooterConfig;
  rowHeader: IndexMap;
  rowFooter: IndexMap;
  width: number;
}

export const calculateFixedConfig = (
  data: MatrixData,
  dataAreaConfig: DataAreaConfig,
  cellWidth,
  customWidthMap,
  dataColumnIndex2LeftMap,
  option: calcFixedOption,
) => {
  const fixedConfig: FixedConfig = {
    currentLeftMap: {},
    currentRightMap: {},
    fixedColWidthMap: {},
    fixedScrollLeftX: {},
    fixedCols: [],
    fixedRightBasedX: -1,
    fixedLeftBasedX: -1,
  };
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) {
    return fixedConfig;
  }
  const {
    fixedLeftIndexs = [],
    fixedRightIndexs = [],
    defaultFixedLeftIndexs = [],
    defaultFixedRightIndexs = [],
  } = dataAreaConfig;

  if (!dataAreaConfig || !(fixedLeftIndexs.length && fixedRightIndexs.length)) {
    // 没有配置锁定列
    return fixedConfig;
  }
  const { rowHeaderConfig, rowFooterConfig, rowHeader, rowFooter, width } =
    option;
  const { cellWidth: rowHeaderCellWidth = cellWidth } = rowHeaderConfig || {};
  const {
    // length: rowFooterLength = 0,
    cellWidth: rowFooterCellWidth = cellWidth,
  } = rowFooterConfig || {};

  // 行头宽
  const rowHeaderWidth =
    (rowHeader.colEndIndex - rowHeader.colStartIndex) * rowHeaderCellWidth;

  // 行尾宽
  const rowFooterWidth =
    (rowFooter.colEndIndex - rowFooter.colStartIndex) * rowFooterCellWidth;

  // 计算数据区域宽度
  const areaWidth = width - rowHeaderWidth - rowFooterWidth;

  // 锁定列宽度
  fixedLeftIndexs.length &&
    fixedLeftIndexs.forEach((colIndex) => {
      fixedConfig.fixedColWidthMap[colIndex] =
        customWidthMap[colIndex] ?? cellWidth;
    });
  fixedRightIndexs.length &&
    fixedRightIndexs.forEach((colIndex) => {
      fixedConfig.fixedColWidthMap[colIndex] =
        customWidthMap[colIndex] ?? cellWidth;
    });

  // 计算 锁定列在数据视图中的位置
  const fixedCols = [...fixedLeftIndexs, ...fixedRightIndexs];
  fixedCols.sort((a, b) => a - b);
  let firstRightFixed = -1;
  fixedCols.forEach((colIndex) => {
    // let left = 0;
    // for (let index = rowHeaderLength; index < colIndex; index++) {
    //   left = left + (customWidthMap[index] ?? cellWidth);
    // }
    const left = dataColumnIndex2LeftMap[+colIndex];
    fixedConfig.fixedScrollLeftX[+colIndex] = left;
    if (
      defaultFixedLeftIndexs?.length &&
      defaultFixedLeftIndexs.includes(colIndex)
    ) {
      fixedConfig.currentLeftMap[colIndex] = left; // 当前已处于锁定的列及位置map
    }
    if (
      defaultFixedRightIndexs?.length &&
      defaultFixedRightIndexs.includes(colIndex) &&
      areaWidth < left
    ) {
      // 计算当前锁定列及后续待锁定列宽度,从而确定右锁定列的left
      let afterWidth = 0;
      defaultFixedRightIndexs.forEach((item) => {
        if (item >= colIndex) {
          afterWidth += customWidthMap[item] ?? cellWidth;
        }
      });
      // 按照数据区宽度 left+areaWidth-后续锁定列的宽度
      fixedConfig.currentRightMap[+colIndex] = areaWidth - afterWidth; // 当前已处于锁定的列及位置map
      if (firstRightFixed === -1) {
        firstRightFixed = +colIndex; // 当前已处于锁定的列及位置map
      }
    }
  });
  // 存储所有需锁定的列索引
  fixedConfig.fixedCols = [...fixedLeftIndexs, ...fixedRightIndexs];

  // 初始化左右锁定基线
  // 左锁定基线默认取最后一个左锁定列
  const defaultLeftIndex = get(
    defaultFixedLeftIndexs,
    defaultFixedLeftIndexs.length - 1,
    -1,
  );
  if (defaultLeftIndex !== -1) {
    fixedConfig.fixedLeftBasedX = get(
      fixedConfig,
      `fixedScrollLeftX[${defaultLeftIndex}]`,
      -1,
    );
  }

  // 右锁定基线默认取 为了满足需要动态计算哪些列需要锁定，而不依赖于defaultFixedRightIndexs
  // 当前currentRightMap第一个右锁定列
  // const defaultRightIndex = get(defaultFixedRightIndexs, 0, -1);
  const defaultRightIndex = firstRightFixed;
  if (defaultRightIndex !== -1) {
    fixedConfig.fixedRightBasedX = get(
      fixedConfig,
      `fixedScrollLeftX[${defaultRightIndex}]`,
      -1,
    );
  } else {
    // 没有右锁定列，默认设置为锁定列最后一个
    fixedConfig.fixedRightBasedX = get(
      fixedConfig,
      `fixedScrollLeftX[${fixedCols[fixedCols.length - 1]}]`,
      -1,
    );
  }
  return fixedConfig;
};
