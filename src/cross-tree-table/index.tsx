/**
 * 用于左树上展开的表格
 */
import * as React from 'react';
import { Loading } from '@/components/Loading';
import { MatrixTable } from '@/core';
import type { MatrixTableProps } from '@/core/MatrixTable/types';
import { cornerCellRender } from '@/table-render/corner-cell-render';
import { cellRender as commonCellRender } from '@/table-render/cell-render';
import { rowHeaderCellRender } from '@/table-render/row-header-cell-render';
import { crossColHeaderCellRender } from '@/table-render/cross-col-header-cell-render';
import { onCellMouseOver, onTableMouseLeave } from '@/utils/hover-style';
import {
  ROW_HEIGHT,
  COL_WIDTH,
  ROW_HEADER_WIDTH,
  COL_HEADER_HEIGHT,
} from './default-config';

import './index.scss';


export interface CrossTreeTableProps
  extends Omit<MatrixTableProps, 'onExpandRow' | 'onExpandCol'> {
  /**
   * 加载状态
   */
  loading?: boolean;
  /**
   * 列头行数
   */
  colHeaderLength: number;
  /**
   * 在点击行展开触发函数
   */
  onExpandRow?: (dataRowIndex: string) => void;
  /**
   * 在点击列展开时触发
   */
  onExpandCol?: (dataColIndex: string) => void;

  colHeaderHeight?: number;
}

export const CrossTreeTable: React.FC<CrossTreeTableProps> = (props) => {
  const {
    loading,
    onExpandRow,
    onExpandCol,
    colHeaderLength,
    colHeaderHeight: outColHeaderHeight,
    ...otherProps
  } = props;

  const colHeaderHeight = outColHeaderHeight ?? COL_HEADER_HEIGHT;

  /**
   * 角落 render
   */
  const cornerRender = React.useCallback(
    (rowIndex, colIndex, item) => {
      return cornerCellRender(
        rowIndex,
        colIndex,
        item,
        outColHeaderHeight ??
          otherProps.colHeaderConfig?.cellHeight ??
          COL_HEADER_HEIGHT,
      );
    },
    [otherProps.colHeaderConfig?.cellHeight, outColHeaderHeight],
  );

  /**
   * 单元格渲染
   */
  const cellRender = React.useCallback(
    (rowIndex, colIndex, item) => {
      return commonCellRender(rowIndex, colIndex, item, {
        matrixData: otherProps.data,
      });
    },
    [otherProps.data],
  );

  /**
   * 行头渲染
   */
  const rowHeaderRender = React.useCallback(
    (rowIndex, colIndex, item) => {
      return rowHeaderCellRender(rowIndex, colIndex, item, onExpandRow);
    },
    [onExpandRow],
  );

  /**
   * 列头渲染
   */
  const colHeaderRender = React.useCallback(
    (rowIndex, colIndex, item) => {
      return crossColHeaderCellRender(rowIndex, colIndex, item, onExpandCol);
    },
    [onExpandCol],
  );

  return (
    <Loading visible={loading} style={{ width: '100%' }}>
      <MatrixTable
        className='react-matrix-table-cross-tree-table'
        cellWidth={COL_WIDTH}
        cellHeight={ROW_HEIGHT}
        cellRender={cellRender}
        cellExtraProps={{
          onMouseEnter: onCellMouseOver,
        }}
        cornerAreaConfig={{
          className: 'corner-cell',
          cellRender: cornerRender,
        }}
        dataAreaConfig={{
          className: 'data-cell-area data-cell ',
        }}
        colHeaderConfig={{
          length: colHeaderLength,
          cellHeight: colHeaderHeight,
          className: 'fixed-col-cell data-cell',
          cellRender: colHeaderRender,
        }}
        rowHeaderConfig={{
          length: 1,
          cellWidth: ROW_HEADER_WIDTH,
          className: 'fixed-row-cell data-cell',
          cellRender: rowHeaderRender,
        }}
        onMouseLeave={onTableMouseLeave}
        // 开启缓存单元格
        cellCache
        {...otherProps}
      />
    </Loading>
  );
};

CrossTreeTable.defaultProps = {
  loading: false,
  colHeaderLength: 1,
};

export default React.memo(CrossTreeTable);
