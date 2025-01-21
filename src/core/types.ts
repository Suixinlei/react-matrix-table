import React from 'react';
import { CompWithHeightMap } from './hoc/WithWidthMap';
import { CellProps } from './cell/types';

export type CellMatrix = CellProps[][];
export interface AreaProps extends CompWithHeightMap {
  /**
   * 对应matrix.state.renderData
   */
  data: MatrixData;
  partition: IndexMap;
  cellWidth: number;
  cellHeight: number;
  areaWidth?: number;
  areaHeight?: number;
  customWidthMap?: Record<number, any>;
  customHeightMap?: Record<number, any>;
  dataRowIndex2TopMap?: Record<number, any>;
  dataColumnIndex2LeftMap?: Record<number, any>;
  cellCache?: boolean;
}

export interface AreaState {
  /**
   * 根据offset切分区域可见单元格
   */
  renderData: CellMatrix;
}

export interface DataSliceIndexes {
  start: number;
  end: number;
}

export interface IndexMap {
  rowStartIndex: number;
  rowEndIndex: number; // 不含
  colStartIndex: number;
  colEndIndex: number; // 不含
}

export type CustomLengthMap = Record<number, number>;

export interface MatrixPartition {
  cornerTopLeft: IndexMap;
  colHeader: IndexMap;
  cornerTopRight: IndexMap;
  rowHeader: IndexMap;
  dataArea: IndexMap;
  rowFooter: IndexMap;
  cornerBottomLeft: IndexMap;
  colFooter: IndexMap;
  cornerBottomRight: IndexMap;
}

export type CellType = 'default' | 'custom';
export type LayoutType = 'default' | 'tree' | 'grid';
export type CornerType = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface MatrixDataItem {
  id?: string; // must be unique, used for key
  // 标记剩余参数是由使用方提供(custom)，还是由matrix生成(default)
  type?: CellType;
  value?: React.ReactNode;

  level?: number; // defaults to RowHeaderConfig.baseLevel

  // 以下八个属性(宽高相关、坐标相关)取值优先级：cell -> (row/col)HeaderCell
  // 宽高相关
  width?: number; // 优先级比rowSpan高
  height?: number; // 优先级比colSpan高
  rowSpan?: number; // defaults to 1
  colSpan?: number; // defaults to 1

  // 业务坐标
  rowIndex?: number;
  colIndex?: number;
  // 视图坐标
  renderRowIndex?: number;
  renderColIndex?: number;

  style?: React.CSSProperties;
  className?: string;

  [key: string]: any;
}

export type MatrixData = MatrixDataItem[][];

export type CellRender = (rowIndex: number, colIndex: number, item: CellProps) => React.ReactNode;

export type AreaRender = ((sliced: CellMatrix) => React.ReactNode | React.ReactNode[]) &
  ((sliced: CellMatrix, corner: CornerType) => React.ReactNode | React.ReactNode[]);

export interface AreaConfig {
  className?: string;
  shouldScroll?: (x: number, y: number) => boolean;
  areaRender?: AreaRender; // 优先级高于cellRender
  cellRender?: CellRender; // 优先级高于MatrixProps['cellRender']
}

export interface HeaderAreaConfig extends AreaConfig {
  /**
   * header 区域大小，如header则为头部{length}列/行，footer则为末尾{length}列/行
   */
  length: number;
  fixedLength?: number;
}

export interface RowHeaderConfig extends HeaderAreaConfig {
  cellWidth?: number;
  layoutType?: LayoutType;
  baseLevel?: number; // defaults to 1
}

export interface RowFooterConfig extends HeaderAreaConfig {
  cellWidth?: number;
}

export interface ColHeaderConfig extends HeaderAreaConfig {
  cellHeight?: number;
}

export interface ColFooterConfig extends HeaderAreaConfig {
  cellHeight?: number;
}

export interface DataAreaConfig extends AreaConfig {
  fixedRowIndexes?: number[];
  fixedColIndexes?: number[];

  //   fixedLeftIndexs = [];
  // fixedRightIndexs = [];
  // defaultFixedLeftIndexs = [];
  // defaultFixedRightIndexs = [];
}

export type CornerAreaConfig = AreaConfig;
/**
 * 动态锁定列计算逻辑所需meta
 */
export interface FixedConfig {
  fixedLeftBasedX?: number; // 当前锁定基线的数据视图坐标X =ScrollX 左侧锁定线位置 // 迁移至每个区域实例的this变量中
  fixedRightBasedX?: number; // 当前右锁定基线的数据视图坐标坐标X 右侧锁定线位置，// 迁移至每个区域实例的this变量中
  currentLeftMap?: Record<number, number>; // 左侧锁定的列及位置  {colIndex,left},left 为视图坐标，
  currentRightMap?: Record<number, number>; // 右侧锁定的列及位置  {colIndex,left}
  fixedColWidthMap?: Record<number, number>; // {key:number} 各个锁定列的宽度
  fixedScrollLeftX?: Record<number, number>; // 存储原始锁定列在数据中的X位置
  fixedCols?: number[]; // 所有待锁定列
  scrollRight?: boolean; // 是否在向右滚动，主要用于右滑时判断临界条件时+当前列宽 // 迁移至每个区域实例的this变量中
  leftFixedCount?: number;
  rightFixedCount?: number;
}

/**
 *
 */
export interface FixedColsConfig {
  /** 动态锁定列相关配置 */
  // fixedLeftIndexs?: number[]; // 左锁定列
  // fixedRightIndexs?: number[]; // 右锁定列
  // defaultFixedLeftIndexs?: number[]; // 默认初始左锁定列
  // defaultFixedRightIndexs?: number[]; // 默认初始右锁定列
  fixedColIndexs?: number[]; // 待锁定列
  onCustomColClick?: () => void; // 自定义列的点击事件
}
