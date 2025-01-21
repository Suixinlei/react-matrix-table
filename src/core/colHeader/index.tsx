import React from 'react';
import { translateDOMPositionXY, addStyle } from 'dom-lib';
import { get } from 'lodash';
import { FixedColsConfig, FixedConfig } from '../types';
import { ColHeaderProps, ColHeaderState } from './types';
import { PREFIX } from '../constants';
import {
  calcSliceIndexes,
  sliceDataAndCells,
  sliceFixedCellsNew,
  initCalcFixedConfig,
  ScrollDirection,
  shouldFixedColsUpdate,
} from '../utils/area-helper';
import Cell from '../cell';
import MatrixContext from '../MatrixTable/context';

export default class ColHeader extends React.Component<
  ColHeaderProps,
  ColHeaderState
> {
  static context: React.ContextType<typeof MatrixContext>;

  static contextType = MatrixContext;

  static displayName = 'ColHeader';

  areaRef: React.RefObject<HTMLDivElement>;

  scrollOffsetX: number;

  startX: number;

  endX: number;

  cachedPartition: any;

  renderData: any[];

  renderCells: Cell[];

  shouldUpdate: boolean;

  cacheRenderedCellsMap?: Record<string, any>;

  fixedCells: Cell[];

  fixedConfig: FixedConfig;

  cacheFixedConfig: FixedConfig;

  cacheFixedCells: Cell[];

  cachedFixedColsConfig: FixedColsConfig;

  scrollDirection: string;

  constructor(props: ColHeaderProps) {
    super(props);
    this.areaRef = React.createRef();
    this.scrollOffsetX = 0;
    this.startX = 0;
    this.endX = 0;
    this.cachedPartition = null;
    this.renderData = [];
    this.shouldUpdate = true;
    this.cacheRenderedCellsMap = {};
    // this.state = {
    //   fixedCells: [],
    //   renderData: [],
    // };
    this.fixedCells = [];
    this.fixedConfig = {};
    this.cachedFixedColsConfig = {};
    this.scrollDirection = 'left'; // 标识滚动方向，用于减少锁定列切片计算次数
  }

  // 放在didUpdate里是因为getDerivedStateFromProps里获取不到this
  // 也就没有this.scrollOffset信息
  componentDidUpdate(prevProps: ColHeaderProps) {
    const { partition, areaWidth } = this.props;
    const { areaWidth: prevWidth } = prevProps;
    let shouldUpdate = false;
    // 折叠展开引起partition变化
    if (partition !== this.cachedPartition) {
      this.cacheRenderedCellsMap = {};
      this.cachedPartition = partition;
      this.fixedCells = [];
      this.cacheFixedConfig = {};
      shouldUpdate = true;
    }
    if (areaWidth !== prevWidth) {
      this.updateDataAndCells();
      this.fixedCells = [];
      this.cacheFixedConfig = {};
      shouldUpdate = true;
    }
    const { dynamicFixedConfig, dynamicalLock } = this.context;
    if (dynamicalLock && dynamicFixedConfig !== this.cachedFixedColsConfig) {
      this.cachedFixedColsConfig = dynamicFixedConfig;
      shouldUpdate = true;
    }
    shouldUpdate && this.update(true);
  }

  handleScroll(deltaX: number) {
    const area = this.areaRef.current;
    if (!area) {
      return;
    }
    const { shouldScroll = () => true } = this.props.areaConfig || {};
    if (!shouldScroll(deltaX - this.scrollOffsetX, 0)) {
      return;
    }
    this.fixedConfig.scrollRight = deltaX < 0;
    this.scrollDirection = deltaX !== 0 ? ScrollDirection.X : ScrollDirection.Y; // 标识滚动方向
    const styles: any = {};
    this._translateDOMPositionXY(styles, (this.scrollOffsetX -= deltaX), 0);
    addStyle(area, styles);

    this.update();
  }

  getViewStartIndexMap() {
    const { dataColumnIndex2LeftMap } = this.props;

    const preLeft = dataColumnIndex2LeftMap[this.startX];
    const absScrollOffsetX = Math.abs(this.scrollOffsetX);
    let newStartX = this.startX;
    let newLeft = preLeft;

    if (preLeft > absScrollOffsetX) {
      while (newLeft > absScrollOffsetX) {
        newStartX -= 1;
        newLeft = dataColumnIndex2LeftMap[newStartX];
      }
    } else {
      while (newLeft < absScrollOffsetX) {
        newLeft = dataColumnIndex2LeftMap[newStartX + 1];
        if (newLeft < absScrollOffsetX) {
          newStartX += 1;
        }
      }
    }

    return {
      viewStartColumnIndex: newStartX,
    };
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
      dataRowIndex2TopMap,
      dataColumnIndex2LeftMap,
      cacheRenderedCellsMap: this.cacheRenderedCellsMap,
    };

    return options;
  }

  updateDataAndCells = () => {
    const { data, partition, customWidthMap, dataColumnIndex2LeftMap } =
      this.props;

    const { rowStartIndex, rowEndIndex, colStartIndex, colEndIndex } =
      partition;
    if ((!this.renderData || !this.renderData.length) && data && data.length) {
      const { cellWidth, areaWidth } = this.props;
      const viewStartIndexMap = this.getViewStartIndexMap();

      const indicesCol = calcSliceIndexes(
        0,
        cellWidth,
        areaWidth,
        colEndIndex,
        colStartIndex,
        customWidthMap,
        viewStartIndexMap.viewStartColumnIndex,
        dataColumnIndex2LeftMap,
      );

      const cellOptions = this.getCellOptions();
      const dataAndCells = sliceDataAndCells(
        data,
        { start: rowStartIndex, end: rowEndIndex },
        indicesCol,
        cellOptions,
      );

      this.renderData = dataAndCells.renderData;
      this.renderCells = dataAndCells.renderCells;
      this.shouldUpdate = true;
    }
    return this.renderData;
  };

  scrollToX(offset = 0) {
    const area = this.areaRef.current;
    if (!area) {
      return;
    }

    const { shouldScroll = () => true } = this.props.areaConfig || {};
    if (!shouldScroll(offset, 0)) {
      return;
    }

    if (this.scrollOffsetX === -offset) {
      // 没变化
      return;
    }
    // // 更新左右锁定基线
    // const { dynamicalLock } = this.context;
    // if (dynamicalLock) {
    //   this.fixedConfig.scrollRight = offset < 0;
    // }
    this.scrollDirection = ScrollDirection.X;
    const styles: any = {};
    this._translateDOMPositionXY(styles, (this.scrollOffsetX = -offset), 0);
    addStyle(area, styles);

    this.update(true);
  }

  resetOffset() {
    const area = this.areaRef.current;
    if (!area) {
      return;
    }
    const styles: any = {};
    this._translateDOMPositionXY(styles, 0, 0);
    addStyle(area, styles);

    this.scrollOffsetX = 0;

    this.update(true);
  }

  update(force = false) {
    const {
      data,
      partition,
      cellWidth,
      areaWidth,
      areaHeight,
      customWidthMap,
      dataColumnIndex2LeftMap,
    } = this.props;
    const { rowStartIndex, rowEndIndex, colStartIndex, colEndIndex } =
      partition;
    if (force) {
      this.startX = 0;
      this.endX = 0;
    }
    const viewStartIndexMap = this.getViewStartIndexMap();

    const indicesCol = calcSliceIndexes(
      this.scrollOffsetX,
      cellWidth,
      areaWidth,
      colEndIndex,
      colStartIndex,
      customWidthMap,
      viewStartIndexMap.viewStartColumnIndex,
      dataColumnIndex2LeftMap,
    );
    const { start, end } = indicesCol;
    // 数据区域变化
    if (force || start !== this.startX || end !== this.endX) {
      this.startX = start;
      this.endX = end;

      const cellOptions = this.getCellOptions();
      const dataAndCells = sliceDataAndCells(
        data,
        { start: rowStartIndex, end: rowEndIndex },
        indicesCol,
        cellOptions,
      );

      this.renderData = dataAndCells.renderData;
      this.renderCells = dataAndCells.renderCells;
      const { dynamicalLock } = this.context;
      if (
        dynamicalLock &&
        shouldFixedColsUpdate(this.fixedConfig, this.scrollDirection)
      ) {
        const { areaConfig } = this.props;
        const length = get(areaConfig, 'length', 1);
        const fixedDataAndCells = sliceFixedCellsNew(
          data,
          { start: 0, end: length },
          indicesCol,
          cellOptions,
          this.fixedConfig,
          areaWidth,
          areaHeight,
        );
        this.fixedCells = fixedDataAndCells[0];
      }

      this.shouldUpdate = true;
    }
    const { dynamicalLock, dynamicFixedConfig } = this.context;

    if (dynamicalLock) {
      const cellOptions = this.getCellOptions();
      const { areaConfig } = this.props;
      const length = get(areaConfig, 'length', 1);
      this.fixedConfig = initCalcFixedConfig(
        data,
        dynamicFixedConfig,
        cellWidth,
        customWidthMap,
        dataColumnIndex2LeftMap,
        -this.scrollOffsetX,
        this.fixedConfig.scrollRight, // 是否向右滚动
        areaWidth,
      );
      if (
        this.cacheFixedConfig?.leftFixedCount !==
          this.fixedConfig.leftFixedCount ||
        this.cacheFixedConfig?.rightFixedCount !==
          this.fixedConfig.rightFixedCount ||
        force ||
        start !== this.startX ||
        end !== this.endX
      ) {
        this.cacheFixedConfig = this.fixedConfig;
        const fixedDataAndCells = sliceFixedCellsNew(
          data,
          { start: 0, end: length },
          indicesCol,
          cellOptions,
          this.fixedConfig,
          areaWidth,
          areaHeight,
        );
        this.fixedCells = fixedDataAndCells[0];
        this.shouldUpdate = true;
      }
    }
    if (this.shouldUpdate) {
      this.forceUpdate();
    }
  }

  _translateDOMPositionXY(styles, x, y) {
    styles.position = 'absolute';
    styles.left = `${x}px`;
    styles.top = `${y}px`;
    translateDOMPositionXY(styles, 0, 0);
  }

  // shouldComponentUpdate(nextProps: ColHeaderProps) {
  //   // const compareKeys: Array<keyof ColHeaderProps> = [
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

  render() {
    const { areaConfig, partition, cellHeight } = this.props;
    this.shouldUpdate = false;
    const { rowStartIndex, rowEndIndex } = partition;
    if (rowStartIndex >= rowEndIndex) {
      return null;
    }

    const { areaRender } = areaConfig || {};
    let content: React.ReactNode | React.ReactNode[];
    let fixedCells: React.ReactNode | React.ReactNode[];
    if (typeof areaRender === 'function') {
      content = areaRender(this.renderData);
    } else {
      content = this.renderCells;
    }
    // todo:后续可能需支持自定义锁定列
    if (this.fixedCells?.length) {
      fixedCells = this.fixedCells;
    }

    const { dynamicalLock } = this.context;
    const height = (rowEndIndex - rowStartIndex) * cellHeight;
    return (
      <div className={`${PREFIX}-col-header-area`} style={{ height }}>
        <div ref={this.areaRef} className={`${PREFIX}-area-container`}>
          {content}
        </div>
        {dynamicalLock && (
          <div className={`${PREFIX}-fixed-area-container`}>{fixedCells}</div>
        )}
      </div>
    );
  }
}
