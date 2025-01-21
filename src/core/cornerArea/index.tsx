import React from 'react';
import { isEqual } from 'lodash';
import { CornerAreaProps, CornerAreaState } from './types';

import { PREFIX } from '../constants';
import { sliceDataAndCells } from '../utils/area-helper';
import Cell from '../cell';

export default class CornerArea extends React.Component<CornerAreaProps, CornerAreaState> {
  static displayName = 'CornerArea';
  cachedPartition: any;
  renderData: any[];
  renderCells: Cell[];
  shouldUpdate: boolean;

  constructor(props: CornerAreaProps) {
    super(props);

    this.cachedPartition = null;
    this.renderData = [];
    this.renderCells = [];
    this.shouldUpdate = true;
  }

  getCellOptions() {
    const {
      partition,
      customWidthMap,
      customHeightMap,
      cellHeight,
      cellWidth,
      areaConfig,
      dataRowIndex2TopMap,
      dataColumnIndex2LeftMap,
    } = this.props;

    const { rowStartIndex, colStartIndex } = partition;
    const options = {
      startingRowIndex: rowStartIndex,
      startingColIndex: colStartIndex,
      cellWidth,
      cellHeight,
      config: areaConfig,
      customWidthMap,
      customHeightMap,
      cacheRenderedCellsMap: undefined,
      dataRowIndex2TopMap,
      dataColumnIndex2LeftMap,
    };

    return options;
  }

  shouldComponentUpdate(nextProps: CornerAreaProps) {
    const compareKeys: Array<keyof CornerAreaProps> = [
      'cornerType',
      'areaConfig',
      'data',
      'partition',
      'cellWidth',
      'cellHeight',
      'areaWidth',
      'areaHeight',
    ];
    const curProps = this.props;
    return compareKeys.some((key) => {
      const cur = curProps[key];
      const next = nextProps[key];
      return ['areaConfig', 'partition'].includes(key) ? !isEqual(cur, next) : cur !== next;
    });
  }

  render() {
    const { data, cornerType, partition, areaConfig, cellWidth, cellHeight } = this.props;

    if (!data.length) {
      return null;
    }
    const { rowStartIndex, rowEndIndex, colStartIndex, colEndIndex } = partition;
    const cellOptions = this.getCellOptions();
    const dataAndCells = sliceDataAndCells(
      data,
      { start: rowStartIndex, end: rowEndIndex },
      { start: colStartIndex, end: colEndIndex },
      cellOptions,
    );

    const { areaRender } = areaConfig || {};
    let content: React.ReactNode | React.ReactNode[];
    if (typeof areaRender === 'function') {
      content = areaRender(dataAndCells.renderData, cornerType);
    } else {
      content = dataAndCells.renderCells;
    }
    const width = (colEndIndex - colStartIndex) * cellWidth;
    const height = (rowEndIndex - rowStartIndex) * cellHeight;
    if (content.length) {
      return (
        <div className={`${PREFIX}-corner-area ${cornerType}`} style={{ width, height }}>
          {content}
        </div>
      );
    }
    return null;
  }
}
