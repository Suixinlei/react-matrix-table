import * as React from 'react';
import { DataFactory } from '@/data-factory';
import type { DataFactoryOptions } from '@/data-factory';

export interface useDataFactoryOptions extends DataFactoryOptions {
  /**
   * 展现形式切换，对应不同的表格
   */
  mode: 'flattenTree' | 'crossTree';
}

export const useDataFactory = (options: useDataFactoryOptions) => {
  const { mode, ...otherProps } = options;
  const [tableMeta, setTableMeta] = React.useState({
    expandedRowIndex: [],
    expandedColIndex: [],
    rowHeaders: [],
    colHeader: [],
    cellData: [],
  });

  const df = React.useMemo(() => {
    if (
      Array.isArray(otherProps.rowHeaders) &&
      Array.isArray(otherProps.colHeaders)
    ) {
      const newDf = new DataFactory({
        ...otherProps,
      });

      setTableMeta({
        rowHeaders: otherProps.rowHeaders,
        colHeaders: otherProps.colHeaders,
        expandedColIndex: newDf?.getExpandedColIndex(),
        expandedRowIndex: newDf?.getExpandedRowIndex(),
      });

      return newDf;
    }
  }, [otherProps.rowHeaders, otherProps.colHeaders, otherProps.cornerName]);

  // React.useEffect(() => {
  //   setTableMeta({
  //     expandedColIndex: df?.getExpandedColIndex(),
  //     expandedRowIndex: df?.getExpandedRowIndex(),
  //   });
  // }, [df?.getExpandedRowIndex(), df?.getExpandedColIndex()]);

  const onExpandRow = (dataRowIndex: string) => {
    df?.onExpandRow(dataRowIndex);
    setTableMeta({
      ...tableMeta,
      expandedColIndex: df?.getExpandedColIndex(),
      expandedRowIndex: df?.getExpandedRowIndex(),
    });
  };

  const onExpandCol = (dataColIndex: string) => {
    df?.onExpandCol(dataColIndex);
    setTableMeta({
      ...tableMeta,
      expandedColIndex: df?.getExpandedColIndex(),
      expandedRowIndex: df?.getExpandedRowIndex(),
    });
  };

  const onExpandAll = () => {
    df?.onExpandAll();
    setTableMeta({
      ...tableMeta,
      expandedColIndex: df?.getExpandedColIndex(),
      expandedRowIndex: df?.getExpandedRowIndex(),
    });
  };

  const updateDS = (dataSource) => {
    df?.updateDS(dataSource);
    setTableMeta({
      ...tableMeta,
      cellData: dataSource,
    });
  };

  if (mode === 'flattenTree') {
    const matrixData = df?.getFlattenExpandMatrix() || [];

    return {
      tableProps: {
        data: matrixData,
        onExpandRow,
        onExpandCol,
        onExpandAll,
      },
      expandedRowIndex: tableMeta.expandedRowIndex,
      expandedColIndex: tableMeta.expandedColIndex,
      updateDS,
    };
  }

  if (mode === 'crossTree') {
    const { colHeaderLength, matrixData = [] } =
      df?.getTreeExpandMatrix() || {};

    return {
      tableProps: {
        data: matrixData,
        colHeaderLength,
        onExpandRow,
        onExpandCol,
        onExpandAll,
      },
      expandedRowIndex: tableMeta.expandedRowIndex,
      expandedColIndex: tableMeta.expandedColIndex,
      updateDS,
    };
  }
};
