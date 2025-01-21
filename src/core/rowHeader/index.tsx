import React from 'react';
// import { isEqual } from 'lodash';
import { translateDOMPositionXY, addStyle } from 'dom-lib';
import { RowHeaderProps, RowHeaderState } from './types';

import { PREFIX } from '../constants';
import MatrixContext from '../MatrixTable/context';
import {
  // renderAreaCells,
  calcSliceIndexes,
  sliceDataAndCells,
  // isAreaPartitionChange
} from '../utils/area-helper';
import Cell from '../cell';

export default class RowHeader extends React.Component<RowHeaderProps, RowHeaderState> {
  static context: React.ContextType<typeof MatrixContext>;
  static contextType = MatrixContext;
  static displayName = 'RowHeader';

  areaRef: React.RefObject<HTMLDivElement>;
  scrollOffsetY: number;
  startY: number;
  endY: number;
  cachedPartition: any;
  renderData: any[];
  renderCells: Cell[];
  shouldUpdate: boolean;
  cacheRenderedCellsMap?: Record<string, any>;

  constructor(props: RowHeaderProps) {
    super(props);
    this.areaRef = React.createRef();
    this.scrollOffsetY = 0;
    this.startY = 0;
    this.endY = 0;
    this.cachedPartition = null;
    this.renderData = [];
    this.shouldUpdate = true;
    this.cacheRenderedCellsMap = {};
    this.renderCells = [];
  }

  updateDataAndCells = () => {
    const {
      data,
      partition,
      customHeightMap,
      dataRowIndex2TopMap,
    } = this.props;

    const { rowStartIndex, rowEndIndex, colStartIndex, colEndIndex } = partition;
    if ((!this.renderData || !this.renderData.length) && data && data.length) {
      const { cellHeight, areaHeight } = this.props;
      const viewStartIndexMap = this.getViewStartIndexMap();

      const indicesRow = calcSliceIndexes(
        0,
        cellHeight,
        areaHeight,
        rowEndIndex,
        rowStartIndex,
        customHeightMap,
        viewStartIndexMap.viewStartRowIndex,
        dataRowIndex2TopMap
      );
      const cellOptions = this.getCellOptions();
      const dataCells = sliceDataAndCells(
        data,
        indicesRow,
        {
          start: colStartIndex,
          end: colEndIndex,
        },
        cellOptions
      );

      this.renderData = dataCells.renderData;
      this.renderCells = dataCells.renderCells;
      this.shouldUpdate = true;
    }
    return this.renderData;
  };

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
    const { expandRow } = this.context;
    const { rowStartIndex, colStartIndex } = partition;
    const options = {
      startingRowIndex: rowStartIndex,
      startingColIndex: colStartIndex,
      cellWidth,
      cellHeight,
      config: areaConfig,
      customWidthMap,
      customHeightMap,
      onExpandRow: expandRow,
      dataRowIndex2TopMap,
      dataColumnIndex2LeftMap,
      cacheRenderedCellsMap: this.cacheRenderedCellsMap,
    };

    return options;
  }

  resetOffset() {
    const area = this.areaRef.current;
    if (!area) {
      return;
    }
    const styles: any = {};
    this._translateDOMPositionXY(styles, 0, 0);
    addStyle(area, styles);

    this.scrollOffsetY = 0;
  }

  scrollToY(offset = 0) {
    const area = this.areaRef.current;
    if (!area) {
      return;
    }

    const { shouldScroll = () => true } = this.props.areaConfig || {};
    if (!shouldScroll(0, offset)) {
      return;
    }

    if (this.scrollOffsetY === -offset) {
      // 没变化
      return;
    }

    const styles: any = {};
    this._translateDOMPositionXY(styles, 0, (this.scrollOffsetY = -offset));
    addStyle(area, styles);
    this.update(true);
  }

  getViewStartIndexMap() {
    const { dataRowIndex2TopMap } = this.props;

    const preTop = dataRowIndex2TopMap[this.startY];
    const absScrollOffsetY = Math.abs(this.scrollOffsetY);
    let newStartY = this.startY;
    let newTop = preTop;

    if (preTop > absScrollOffsetY) {
      while (newTop > absScrollOffsetY) {
        newStartY -= 1;
        newTop = dataRowIndex2TopMap[newStartY];
      }
    } else {
      while (newTop < absScrollOffsetY) {
        newTop = dataRowIndex2TopMap[newStartY + 1];
        if (newTop < absScrollOffsetY) {
          newStartY += 1;
        }
      }
    }

    return {
      viewStartRowIndex: newStartY,
    };
  }

  update(force = false) {
    const {
      data,
      partition,
      cellHeight,
      areaHeight,
      customHeightMap,
      dataRowIndex2TopMap,
    } = this.props;
    const { rowStartIndex, rowEndIndex, colStartIndex, colEndIndex } = partition;

    if (force) {
      this.startY = 0;
      this.endY = 0;
    }

    const viewStartIndexMap = this.getViewStartIndexMap();
    const indicesRow = calcSliceIndexes(
      this.scrollOffsetY,
      cellHeight,
      areaHeight,
      rowEndIndex,
      rowStartIndex,
      customHeightMap,
      viewStartIndexMap.viewStartRowIndex,
      dataRowIndex2TopMap
    );
    const { start, end } = indicesRow;

    // 数据区域变化
    if (force || start !== this.startY || end !== this.endY) {
      this.startY = start;
      this.endY = end;

      const cellOptions = this.getCellOptions();

      const dataCells = sliceDataAndCells(
        data,
        indicesRow,
        {
          start: colStartIndex,
          end: colEndIndex,
        },
        cellOptions
      );
      this.renderData = dataCells.renderData;
      this.renderCells = dataCells.renderCells;

      this.shouldUpdate = true;
      this.forceUpdate();
    }

    if (force) {
      this.forceUpdate();
    }
  }

  _translateDOMPositionXY(styles, x, y) {
    styles.position = 'absolute';
    styles.left = x + 'px';
    styles.top = y + 'px';
    translateDOMPositionXY(styles, 0, 0);
  }

  handleScroll(deltaY: number) {
    const area = this.areaRef.current;
    if (!area) {
      return;
    }
    const { shouldScroll = () => true } = this.props.areaConfig || {};
    if (!shouldScroll(0, deltaY - this.scrollOffsetY)) {
      return;
    }
    const styles: any = {};
    this._translateDOMPositionXY(styles, 0, (this.scrollOffsetY -= deltaY));
    addStyle(area, styles);
    this.update();
  }

  // shouldComponentUpdate(nextProps: RowHeaderProps) {
  //   // const compareKeys: Array<keyof RowHeaderProps> = [
  //   //   'areaConfig',
  //   //   'data',
  //   //   'partition',
  //   //   'cellWidth',
  //   //   'cellHeight',
  //   //   'areaWidth',
  //   //   'areaHeight',
  //   // ];
  //   // const curProps = this.props;
  //   // const isShouldUpdate =
  //   //   compareKeys.some(key => {
  //   //     const cur = curProps[key];
  //   //     const next = nextProps[key];
  //   //     return ['areaConfig', 'partition'].includes(key)
  //   //       ? !isEqual(cur, next)
  //   //       : cur !== next;
  //   //   }) || this.shouldUpdate;

  //   const { partition: prePartition } = this.props;
  //   const { partition } = nextProps;
  //   const isShouldUpdate = isAreaPartitionChange(prePartition, partition);

  //   return isShouldUpdate;
  // }

  // 放在didUpdate里是因为getDerivedStateFromProps里获取不到this
  // 也就没有this.scrollOffset信息
  componentDidUpdate(prevProps: RowHeaderProps) {
    const { partition, areaHeight } = this.props;
    const { areaHeight: prevHeight } = prevProps;
    // 折叠展开引起partition变化
    if (partition !== this.cachedPartition) {
      this.cacheRenderedCellsMap = {};
      this.update(true);
      this.cachedPartition = partition;
    }
    if (areaHeight !== prevHeight) {
      this.renderData = this.updateDataAndCells();
      this.update(true);
    }
  }

  render() {
    const { areaConfig, partition, cellWidth } = this.props;

    this.shouldUpdate = false;
    const { colStartIndex, colEndIndex } = partition;

    if (colStartIndex >= colEndIndex) {
      return null;
    }

    const { areaRender } = areaConfig || {};
    let content: React.ReactNode | React.ReactNode[];
    if (typeof areaRender === 'function') {
      content = areaRender(this.renderData);
    } else {
      content = this.renderCells;
    }

    const width = (colEndIndex - colStartIndex) * cellWidth;
    return (
      <div className={`${PREFIX}-row-header-area`} style={{ width }}>
        <div ref={this.areaRef} className={`${PREFIX}-area-container`}>
          {content}
        </div>
      </div>
    );
  }
}

