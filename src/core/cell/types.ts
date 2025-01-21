/**
 * 单元格类型定义
 */

import { MatrixDataItem, AreaConfig } from '../types';

export interface CellProps extends MatrixDataItem {
  config?: AreaConfig;

  // 行头相关
  isExpand?: boolean;
  onExpandRow?: (rowIndex: number, expand: boolean, node: Record<string, any>) => void;

  leftID: string;
  rightID: string;
  topID: string;
  bottomID: string;
}

export interface CellState {
  [key: string]: any;
}
