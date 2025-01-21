import React from 'react';
import { v4 as uuidV4 } from 'uuid';
import { translateDOMPositionXY } from 'dom-lib';
import Cell from '../cell';
import { CellProps } from '../cell/types';
import {
  CellMatrix,
  AreaConfig,
  DataSliceIndexes,
  MatrixData,
  CustomLengthMap,
  FixedConfig,
  // DataAreaConfig,
} from '../types';

// import { calcFixedOption } from './matrix-helper';

export const searchStart = (
  offsetMap: Record<number, number>,
  absOffset: number,
  startIndex: number,
  endIndex: number,
  baseLength: number,
) => {
  let pivot = startIndex + Math.floor(absOffset / baseLength);
  const maxIndex = endIndex - 1;
  pivot = Math.min(pivot, maxIndex);
  let left = Number.NaN;
  while (true) {
    if (pivot > maxIndex) {
      pivot = maxIndex;
      break;
    }
    if (pivot < startIndex) {
      pivot = startIndex;
      break;
    }
    if (offsetMap[pivot] > absOffset) {
      pivot -= 1;
      if (offsetMap[pivot] <= absOffset) {
        left = pivot;
        break;
      }
    } else {
      left = pivot;
      pivot += 1;
      if (offsetMap[pivot] > absOffset) {
        break;
      } else {
        left = pivot;
      }
    }
  }
  return left;
};

export const calcSliceIndexes = (
  offset: number,
  cellLength: number,
  areaLength: number,
  maxIndex: number,
  startIndex: number,
  customWidthMap: CustomLengthMap,
  preStartIndex,
  dataIndex2PositionMap,
): DataSliceIndexes => {
  const absOffset = Math.abs(offset);
  let start = preStartIndex;
  if (!start && startIndex) {
    start = startIndex;
  }
  let startOffset = dataIndex2PositionMap[start] ?? cellLength;
  let end = start + 1;
  // while (accOffset < absOffset) {
  //   count += 1;
  //   accOffset += customWidthMap[startIndex + count] ?? cellLength;
  // }
  // const start = startIndex + count;
  while (startOffset < absOffset + areaLength) {
    end += 1;
    startOffset += customWidthMap[end] ?? cellLength;
  }
  end += 1;
  end = Math.min(end, maxIndex);
  return { start, end };
};

export const sliceDataAndCells = (
  data: MatrixData,
  indicesRow: DataSliceIndexes,
  indicesCol: DataSliceIndexes,
  options: CellRenderOptions,
): any => {
  /* eslint-disable no-unused-expressions */
  const {
    cellWidth,
    cellHeight,
    config,
    onExpandRow,
    cacheRenderedCellsMap = {},
    dataRowIndex2TopMap = {},
    dataColumnIndex2LeftMap = {},
  } = options;

  const cells = [];
  const isRenderedMap = {};
  /* eslint-enable no-unused-expressions */

  const sliced: CellMatrix = [];
  const { start: startRow, end: endRow } = indicesRow;
  const { start: startCol, end: endCol } = indicesCol;
  if (startRow === endRow || startCol === endCol) {
    return {
      renderData: sliced,
      renderCells: cells,
      fixedCells: [],
    };
  }

  for (let rowIndex = startRow; rowIndex < endRow; rowIndex++) {
    if (rowIndex >= data.length) {
      continue;
    }
    const row: CellProps[] = [];
    for (let colIndex = startCol; colIndex < endCol; colIndex++) {
      // 需要处理的 单元格
      let item = data[rowIndex]?.[colIndex];

      // 数据未传入的兼容处理
      if (!item) {
        item = { id: uuidV4() };
        if (!data[rowIndex]) {
          // 没有这一行
          data[rowIndex] = [item];
        } else if (!data[rowIndex][colIndex]) {
          data[rowIndex][colIndex] = item;
        }
      }

      // 获取列头
      const colHeader = data[0][colIndex];
      // 获取行头
      const rowHeader = data[rowIndex][0];

      let cell: CellProps = {
        ...item,
        leftID: data[rowIndex]?.[colIndex - 1]?.id ?? null,
        rightID: data[rowIndex]?.[colIndex + 1]?.id ?? null,
        topID: data[rowIndex - 1]?.[colIndex]?.id ?? null,
        bottomID: data[rowIndex + 1]?.[colIndex]?.id ?? null,
      };

      if (item.type === 'custom') {
        row.push(cell);
      } else {
        if (!item.id) {
          const id = uuidV4();
          item.id = id;
          cell.id = id;
        }
        cell = {
          ...cell,
          width: item?.width ?? colHeader?.width,
          height: item?.height ?? rowHeader?.height,
          rowSpan: item?.rowSpan,
          colSpan: item?.colSpan,
          rowIndex: item?.rowIndex ?? rowHeader?.rowIndex,
          colIndex: item?.colIndex ?? colHeader?.colIndex,
          renderRowIndex:
            item?.renderRowIndex ?? rowHeader?.renderRowIndex ?? rowIndex,
          renderColIndex: item?.renderColIndex ?? colHeader?.renderColIndex,
        };
        row.push(cell);
      }

      const {
        id,
        renderRowIndex,
        renderColIndex = cell.colIndex,
        width: itemWidth,
        height: itemHeight,
        rowSpan,
        colSpan,
      } = cell;

      if (isRenderedMap[id]) {
        continue;
      }

      const cacheCell = cacheRenderedCellsMap[id];
      // const cacheDataCell = cacheRenderedCellsMap[`${id}-dataCell`];
      // if (cellCache && cacheCell && item === cacheDataCell) {
      if (cacheCell) {
        cells.push(cacheCell);
        isRenderedMap[id] = true;
        continue;
      }

      const top = dataRowIndex2TopMap[renderRowIndex];
      const left = dataColumnIndex2LeftMap[renderColIndex];

      let width = 0;
      if (colSpan > 1) {
        for (let x = renderColIndex; x < renderColIndex + colSpan; x++) {
          width += data[0][x].width ?? cellWidth;
        }
      } else {
        width = itemWidth ?? cellWidth;
      }

      let height = 0;
      if (rowSpan > 1) {
        for (let y = renderRowIndex; y < renderRowIndex + rowSpan; y++) {
          height += data[y][0].height ?? cellHeight;
        }
      } else {
        height = itemHeight ?? cellHeight;
      }

      const style = { top, left, width, height };
      // translateDOMPositionXY(style, 0, 0);

      const cellProps: CellProps = {
        ...cell,
        style,
        config,
        onExpandRow,
      };
      const cellComp = (
        <Cell key={id} {...cellProps} cellData={item?.payload} />
      );
      cells.push(cellComp);

      cacheRenderedCellsMap[id] = cellComp;
      cacheRenderedCellsMap[`${id}-dataCell`] = item;
      isRenderedMap[id] = true;
    }
    sliced.push(row);
  }

  // 返回分片结果
  return {
    renderData: sliced,
    renderCells: cells,
  };
};

export interface CellRenderOptions {
  startingRowIndex: number;
  startingColIndex: number;
  cellWidth: number;
  cellHeight: number;
  config: AreaConfig;
  customWidthMap: CustomLengthMap;
  customHeightMap: CustomLengthMap;
  onExpandRow?: CellProps['onExpandRow'];
  cacheRenderedCellsMap?: Record<string, any>;
  dataRowIndex2TopMap: Record<number, any>;
  dataColumnIndex2LeftMap: Record<number, any>;
}

export const renderAreaCells = (
  sliced: CellMatrix,
  options: CellRenderOptions,
): Cell[] => {
  /* eslint-disable no-unused-expressions */
  const {
    cellWidth,
    cellHeight,
    config,
    onExpandRow,
    cacheRenderedCellsMap = {},
    dataRowIndex2TopMap = {},
    dataColumnIndex2LeftMap = {},
  } = options;
  /* eslint-enable no-unused-expressions */

  const cells = [];
  const isRenderedMap = {};

  for (let rowIndex = 0; rowIndex < sliced.length; rowIndex++) {
    const row = sliced[rowIndex];
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const item = row[colIndex];
      const {
        id,
        renderRowIndex,
        renderColIndex = item.colIndex,
        width: itemWidth,
        height: itemHeight,
        rowSpan,
        colSpan,
      } = item;

      if (isRenderedMap[id]) {
        continue;
      }

      const cacheCell = cacheRenderedCellsMap[id];
      const cacheDataCell = cacheRenderedCellsMap[`${id}-dataCell`];

      if (cacheCell && item === cacheDataCell) {
        cells.push(cacheCell);
        continue;
      }

      const top = dataRowIndex2TopMap[renderRowIndex];
      const left = dataColumnIndex2LeftMap[renderColIndex];

      const width = itemWidth ?? (colSpan ?? 1) * cellWidth;
      const height = itemHeight ?? (rowSpan ?? 1) * cellHeight;

      // let style = { top, left, width, height };

      const style: React.CSSProperties = {
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        height,
      };
      translateDOMPositionXY(style, left, top);

      const cellProps: CellProps = {
        ...item,
        style,
        config,
        onExpandRow,
      };

      const cell = <Cell key={id} {...cellProps} cellData={item?.payload} />;
      cells.push(cell);
      cacheRenderedCellsMap[id] = cell;
      cacheRenderedCellsMap[`${id}-dataCell`] = item;
      isRenderedMap[id] = true;
    }
  }
  return cells;
};

export const isAreaPartitionChange = (prePartition, partition): boolean => {
  const { preColEndIndex, preColStartIndex, preRowEndIndex, preRowStartIndex } =
    prePartition;
  const { colEndIndex, colStartIndex, rowEndIndex, rowStartIndex } = partition;

  return (
    preColStartIndex !== colStartIndex ||
    preColEndIndex !== colEndIndex ||
    preRowStartIndex !== rowStartIndex ||
    preRowEndIndex !== rowEndIndex
  );
};

/**
 * 锁定列fixedCols变化后计算 重新初始化计算锁定配置
 * 核心计算锁定基线以及当前需要锁定的左侧列和右侧列
 * @param data
 * @param dataAreaConfig
 * @param cellWidth
 * @param customWidthMap
 * @param dataColumnIndex2LeftMap
 * @param scrollX
 * @param scrollRight
 * @param areaWidth
 * @returns
 *
 */
export const initCalcFixedConfig = (
  data: MatrixData,
  dynamicFixedConfig,
  cellWidth,
  customWidthMap,
  dataColumnIndex2LeftMap,
  scrollX = 0,
  scrollRight = false,
  areaWidth,
) => {
  const fixedConfig: FixedConfig = {
    currentLeftMap: {},
    currentRightMap: {},
    fixedColWidthMap: {},
    fixedScrollLeftX: {},
    fixedCols: [],
    fixedRightBasedX: -1,
    fixedLeftBasedX: -1,
    scrollRight,
    leftFixedCount: 0,
    rightFixedCount: 0,
  };
  if (
    !dynamicFixedConfig ||
    !Array.isArray(data) ||
    data.length === 0 ||
    !Array.isArray(data[0])
  ) {
    return fixedConfig;
  }
  const { fixedColIndexs } = dynamicFixedConfig;
  if (!fixedColIndexs?.length) {
    // 没有配置锁定列
    return fixedConfig;
  }
  // 锁定列宽度
  fixedColIndexs.forEach((colIndex) => {
    fixedConfig.fixedColWidthMap[colIndex] =
      customWidthMap[colIndex] ?? cellWidth;
  });

  // 计算 锁定列在数据视图中的位置
  const fixedCols = [...fixedColIndexs];
  fixedCols.sort((a, b) => a - b);
  let rightStartIndex = 0;
  let leftFixedWidth = 0;
  // 计算左侧锁定列是否变化
  let _leftFixedBaseScrollX = scrollX; // 当前左锁定基线
  fixedCols.forEach((colIndex) => {
    const left = dataColumnIndex2LeftMap[+colIndex]; // 当前已滚动，真实位置要叫
    fixedConfig.fixedScrollLeftX[+colIndex] = left;
    const colWidth = fixedConfig.fixedColWidthMap[colIndex];

    // ---------------------折叠展开、区域折叠时初始化效果计算--------------------//
    if (left <= _leftFixedBaseScrollX) {
      fixedConfig.currentLeftMap[colIndex] = leftFixedWidth; // 当前已处于锁定的列及位置map
      leftFixedWidth += colWidth; // 滚动距离加已锁定列
      _leftFixedBaseScrollX += colWidth; // 滚动距离加已锁定列
      rightStartIndex++;
    }
  });
  const rightFixedCols = fixedCols.splice(rightStartIndex).reverse();
  let rightFixedWidth = 0;
  let _rightFixedBaseScrollX = scrollX + areaWidth;
  rightFixedCols.forEach((colIndex) => {
    const left = dataColumnIndex2LeftMap[+colIndex];
    const colWidth = fixedConfig.fixedColWidthMap[colIndex];
    // 计算右侧锁定列是否变化
    // if (left + (scrollRight ? colWidth : 0) > _rightFixedBaseScrollX) {
    if (left + colWidth > _rightFixedBaseScrollX) {
      fixedConfig.currentRightMap[colIndex] =
        areaWidth - rightFixedWidth - colWidth; // 当前已处于锁定的列及位置map
      rightFixedWidth += colWidth;
      _rightFixedBaseScrollX -= colWidth;
    }
  });
  // 存储所有需锁定的列索引
  fixedConfig.fixedCols = [...fixedColIndexs];
  fixedConfig.scrollRight = scrollRight;
  fixedConfig.leftFixedCount = Object.keys(fixedConfig.currentLeftMap).length;
  fixedConfig.rightFixedCount = Object.keys(fixedConfig.currentRightMap).length;
  return fixedConfig;
};

/**
 * 切片锁定数据，功能同sliceDataAndCells,重构滚动时的锁定计算
 * 返回
 */
export const sliceFixedCellsNew = (
  data: MatrixData,
  indicesRow: DataSliceIndexes,
  indicesCol: DataSliceIndexes,
  options: CellRenderOptions,
  fixedConfig: FixedConfig,
  areaWidth: number,
  areaHeight = 0,
) => {
  if (!fixedConfig) {
    return null;
  }
  const fixedYCells = []; // 存储虚拟滚动的锁定列
  const fixedXYCells = []; // 存储特殊不需要跟随滚动的固定列
  const fixedXCells = []; // 存储锁定行的单元格
  const isRenderedMap = {}; // 缓存合并单元格
  const isCustomColMap = {}; // 缓存自定义整列
  const {
    cellWidth,
    cellHeight,
    config,
    onExpandRow,
    dataRowIndex2TopMap = {},
    dataColumnIndex2LeftMap = {},
  } = options;
  const { fixedCols } = fixedConfig;
  if (!fixedCols || !fixedCols.length || !data || !data.length) {
    // 没有配置锁定列
    return [null, null];
  }
  const { start: startRow, end: endRow } = indicesRow;
  fixedCols.forEach((colIndex) => {
    // 用于特殊标识该列是否为需要fixed的合并单元格，用于处理望月亭特殊逻辑，合并且fixed的整列额外放置，不进行虚拟滚动,重置top
    let isCustomCol = false;
    for (let rowIndex = startRow; rowIndex < endRow; rowIndex++) {
      let item = data[rowIndex]?.[colIndex];
      const colHeaderItem = data[0]?.[colIndex];
      // 特殊处理 存在id, 合并单元格时，top设置为0，
      // 从列头获取fixed信息
      const { fixed, id: colHeaderId } = colHeaderItem || {}; // 列头存在fixed属性且有id，阻止其他单元格渲染
      if (!item) {
        item = { id: uuidV4() };
        if (!data[rowIndex]) {
          // 没有这一行
          data[rowIndex] = [item];
        } else if (!data[rowIndex][colIndex]) {
          data[rowIndex][colIndex] = item;
        }
      }
      const colHeader = data[0][colIndex];
      const rowHeader = data[rowIndex][0];
      if (!colHeader && !rowHeader) {
        return null;
      }
      let cell: CellProps = {
        ...item,
        leftID: data[rowIndex]?.[colIndex - 1]?.id ?? null,
        rightID: data[rowIndex]?.[colIndex + 1]?.id ?? null,
        topID: data[rowIndex - 1]?.[colIndex]?.id ?? null,
        bottomID: data[rowIndex + 1]?.[colIndex]?.id ?? null,
      };

      if (!item.id) {
        const id = uuidV4();
        item.id = id;
        cell.id = id;
      }
      cell = {
        ...cell,
        width: item?.width ?? colHeader?.width,
        height: item?.height ?? rowHeader?.height,
        rowSpan: item?.rowSpan,
        colSpan: item?.colSpan,
        rowIndex: item?.rowIndex ?? rowHeader?.rowIndex,
        colIndex: item?.colIndex ?? colHeader?.colIndex,
        renderRowIndex:
          item?.renderRowIndex ?? rowHeader?.renderRowIndex ?? rowIndex,
        renderColIndex: item?.renderColIndex ?? colHeader?.renderColIndex,
      };

      const {
        id,
        renderRowIndex,
        renderColIndex = cell.colIndex,
        width: itemWidth,
        height: itemHeight,
        rowSpan,
        colSpan,
      } = cell;

      if (isRenderedMap[id] || isCustomColMap[colHeaderId]) {
        continue;
      }
      const top = dataRowIndex2TopMap[renderRowIndex];
      const left = dataColumnIndex2LeftMap[renderColIndex];

      const width = itemWidth ?? (colSpan ?? 1) * cellWidth;
      const height = itemHeight ?? (rowSpan ?? 1) * cellHeight;

      let style: React.CSSProperties = {
        top,
        left,
        width,
        height,
        zIndex: 10,
      };

      if (fixed && rowIndex !== 0) {
        let _height = areaHeight;
        // fixed 当前屏数据行不满
        if ((endRow - startRow) * cellHeight < areaHeight) {
          _height = (endRow - startRow) * cellHeight + 10;
        }
        isCustomCol = true;
        style = {
          ...style,
          height: _height || cellHeight,
          top: 0,
        };
        cell.rowIndex = -1;
      }

      // translateDOMPositionXY(style, 0, 0);

      const cellProps: CellProps = {
        ...cell,
        // value: '锁定列',
        style,
        config,
        onExpandRow,
      };
      // 当前视图中存在锁定列
      const { fixedScrollLeftX, currentLeftMap, currentRightMap } =
        fixedConfig || {}; // 判断是否存在锁定相关配置
      if (fixedScrollLeftX && Object.keys(fixedScrollLeftX).length > 0) {
        // 左侧锁定列
        if (currentLeftMap[colIndex] !== undefined) {
          const _cellProps = { ...cellProps };
          const newStyle = { ...style };
          newStyle.left = currentLeftMap[colIndex];
          const fixedCell = (
            <Cell
              {..._cellProps}
              className={
                isCustomCol
                  ? 'dynamical-fixed-x-y-cell dynamical-fixed-cell'
                  : 'dynamical-fixed-y-cell dynamical-fixed-cell'
              }
              key={`${id}-fixed`}
              style={newStyle}
            />
          );
          if (fixedCell && isCustomCol) {
            fixedXYCells.push(fixedCell);
            isCustomColMap[colHeaderId] = true;
          } else {
            fixedYCells.push(fixedCell);
          }
        }

        // 右侧锁定列
        if (currentRightMap[colIndex] !== undefined) {
          const _cellProps = { ...cellProps };
          const newStyle = { ...style };
          newStyle.left = currentRightMap[colIndex];
          const fixedCell = (
            <Cell
              {..._cellProps}
              className={
                isCustomCol
                  ? 'dynamical-fixed-x-y-cell dynamical-fixed-cell'
                  : 'dynamical-fixed-y-cell dynamical-fixed-cell'
              }
              key={`${id}-fixed`}
              style={newStyle}
            />
          );
          if (fixedCell && isCustomCol) {
            fixedXYCells.push(fixedCell);
            isCustomColMap[colHeaderId] = true;
          } else {
            fixedYCells.push(fixedCell);
          }
        }
      }
      isRenderedMap[id] = true;
      //
      const { start: startCol, end: endCol } = indicesCol;
      if (
        fixed &&
        !Object.keys(fixedConfig.currentLeftMap).includes(`${colIndex}`) &&
        !Object.keys(fixedConfig.currentRightMap).includes(`${colIndex}`) &&
        rowIndex !== 0 &&
        colIndex >= startCol &&
        colIndex <= endCol &&
        !isCustomColMap[colHeaderId]
      ) {
        const cellComp = (
          <Cell
            key={id}
            {...cellProps}
            className='dynamical-fixed-x-cell dynamical-fixed-cell'
          />
        );
        fixedXCells.push(cellComp);
        isCustomColMap[colHeaderId] = true;
      }
    }
  });
  return [fixedYCells, fixedXYCells, fixedXCells];
};
export const ScrollDirection = {
  X: 'horizontal', // 水平
  Y: 'vertical', // 垂直
};

/**
 * 是否需要更新锁定切片
 * @param dynamicalLock 锁定列开关
 * @param fixedConfig 锁定配置
 * @param direction 滚动方向
 * @returns
 */
export const shouldFixedColsUpdate = (fixedConfig, direction) => {
  if (direction === ScrollDirection.Y) {
    return true;
  }
  // 水平滚动 且存在未锁定列
  if (
    direction === ScrollDirection.X &&
    fixedConfig?.leftFixedCount + fixedConfig?.rightFixedCount !==
      fixedConfig?.fixedCols?.length
  ) {
    return true;
  }
  return false;
};
