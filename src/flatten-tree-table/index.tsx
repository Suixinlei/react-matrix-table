import * as React from 'react';
import { MatrixTable } from '@/core';
import type { MatrixTableProps } from '@/core/MatrixTable/types';
import { Loading } from '@/components/Loading';
import {
  ROW_HEIGHT,
  COL_WIDTH,
  ROW_HEADER_WIDTH,
  COL_HEADER_HEIGHT,
} from './default-config';

import { cornerCellRender } from '@/table-render/corner-cell-render';
import { cellRender as commonCellRender } from '@/table-render/cell-render';
import { rowHeaderCellRender } from '@/table-render/row-header-cell-render';
import { flattenColHeaderCellRender } from '@/table-render/flatten-col-header-cell-render';
import { onCellMouseOver, onTableMouseLeave } from '@/utils/hover-style';

import './index.scss';

export interface CnEiFlattenTreeTableProps
  extends Omit<MatrixTableProps, 'onExpandRow' | 'onExpandCol'> {
  /**
   * 加载状态
   */
  loading?: boolean;
  /**
   * 在点击行展开触发函数
   */
  onExpandRow?: (dataRowIndex: string) => void;
  /**
   * 在点击列展开时触发
   */
  onExpandCol?: (dataColIndex: string) => void;
}

export const CnEiFlattenTreeTable: React.FC<CnEiFlattenTreeTableProps> = (
  props,
) => {
  const { loading, onExpandRow, onExpandCol, ...otherProps } = props;

  /**
   * 角落 render
   */
  const cornerRender = React.useCallback(
    (rowIndex, colIndex, item) => {
      return cornerCellRender(
        rowIndex,
        colIndex,
        item,
        otherProps.colHeaderConfig?.cellHeight || COL_HEADER_HEIGHT,
      );
    },
    [otherProps.colHeaderConfig?.cellHeight],
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
      return flattenColHeaderCellRender(rowIndex, colIndex, item, onExpandCol);
    },
    [onExpandCol],
  );

  return (
    <Loading visible={loading} style={{ width: '100%' }}>
      {Array.isArray(otherProps.data) && otherProps.data.length > 0 && (
        <MatrixTable
          className='cn-ei-flatten-tree-table'
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
            className: 'data-cell data-cell-area',
          }}
          colHeaderConfig={{
            length: 1,
            cellHeight: COL_HEADER_HEIGHT,
            className: 'fixed-row-cell data-cell',
            cellRender: colHeaderRender,
          }}
          rowHeaderConfig={{
            length: 1,
            cellWidth: ROW_HEADER_WIDTH,
            className: 'fixed-col-cell data-cell',
            cellRender: rowHeaderRender,
          }}
          onMouseLeave={onTableMouseLeave}
          // 开启缓存单元格
          cellCache
          {...otherProps}
        />
      )}
    </Loading>
  );
};

CnEiFlattenTreeTable.defaultProps = {
  loading: false,
};

CnEiFlattenTreeTable.displayName = 'FlattenTreeTable';
