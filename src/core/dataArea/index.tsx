import React from 'react';
// import { isEqual } from 'lodash';
import { translateDOMPositionXY, addStyle } from 'dom-lib';
import { FixedColsConfig, FixedConfig } from '../types';
import { DataAreaProps, DataAreaState } from './types';
import { PREFIX } from '../constants';
import {
  // renderAreaCells,
  calcSliceIndexes,
  sliceDataAndCells,
  // sliceFixedCells,
  sliceFixedCellsNew,
  initCalcFixedConfig,
  shouldFixedColsUpdate,
  ScrollDirection,
  // isAreaPartitionChange
} from '../utils/area-helper';
import Cell from '../cell';
import MatrixContext from '../MatrixTable/context';

export default class DataArea extends React.Component<DataAreaProps, DataAreaState> {
  static context: React.ContextType<typeof MatrixContext>;
  static contextType = MatrixContext;
  static displayName = 'DataArea';

  areaRef: React.RefObject<HTMLDivElement>;
  scrollOffsetX: number;
  scrollOffsetY: number;
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  cachedPartition: any;
  renderData: any[];
  renderCells: Cell[];
  shouldUpdate: boolean;
  cacheRenderedCellsMap: Record<string, any>;
  fixedYCells: Cell[];
  fixedXYCells: Cell[];
  fixedXCells: Cell[];
  fixedAreaRef: React.RefObject<HTMLDivElement>;
  fixedXAreaRef: React.RefObject<HTMLDivElement>; // 水平方向未锁定，竖直方向锁定，fixed不在跟随滚动
  fixedConfig: FixedConfig;
  cachedFixedCells: {
    fixedYCells: Cell[];
    fixedXYCells: Cell[];
    fixedXCells: Cell[];
  };
  cacheFixedConfig: FixedConfig;
  cachedFixedColsConfig: FixedColsConfig;
  scrollDirection: string;
  constructor(props: DataAreaProps) {
    super(props);
    this.areaRef = React.createRef();
    this.scrollOffsetX = 0;
    this.scrollOffsetY = 0;
    this.startX = 0;
    this.endX = 0;
    this.startY = 0;
    this.endY = 0;
    this.cachedPartition = null;
    this.renderData = [];
    this.renderCells = [];
    this.shouldUpdate = true;
    this.cacheRenderedCellsMap = {};
    this.fixedYCells = [];
    this.fixedXYCells = [];
    this.fixedXCells = [];
    this.fixedAreaRef = React.createRef();
    this.fixedXAreaRef = React.createRef();
    this.fixedConfig = {};
    this.cachedFixedCells = {
      fixedYCells: [],
      fixedXYCells: [],
      fixedXCells: [],
    };
    this.cacheFixedConfig = {};
    this.scrollDirection = 'left'; // 标识滚动方向，用于减少锁定列切片计算次数
  }

  updateDataAndCells = () => {
    const {
      cellWidth,
      areaWidth,
      cellHeight,
      areaHeight,
      data,
      customHeightMap,
      customWidthMap,
      partition,
      dataRowIndex2TopMap,
      dataColumnIndex2LeftMap,
      // cellCache,
    } = this.props;
    const { rowStartIndex, rowEndIndex, colStartIndex, colEndIndex } = partition;

    if ((!this.renderData || this.renderData.length) && data && data.length) {
      const viewStartIndexMap = this.getViewStartIndexMap();
      const indicesRow = calcSliceIndexes(
        0,
        cellHeight,
        areaHeight,
        rowEndIndex,
        rowStartIndex,
        customHeightMap,
        viewStartIndexMap.viewStartRowIndex !== 0
          ? viewStartIndexMap.viewStartRowIndex
          : rowStartIndex,
        dataRowIndex2TopMap,
      );
      const indicesCol = calcSliceIndexes(
        0,
        cellWidth,
        areaWidth,
        colEndIndex,
        colStartIndex,
        customWidthMap,
        viewStartIndexMap.viewStartColumnIndex !== 0
          ? viewStartIndexMap.viewStartColumnIndex
          : colStartIndex,
        dataColumnIndex2LeftMap,
      );

      const cellOptions = this.getCellOptions();
      const dataAndCells = sliceDataAndCells(data, indicesRow, indicesCol, cellOptions);
      this.shouldUpdate = true;
      this.renderData = dataAndCells.renderData;
      this.renderCells = dataAndCells.renderCells;
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

    const { rowStartIndex, colStartIndex } = partition;
    const options = {
      startingRowIndex: rowStartIndex,
      startingColIndex: colStartIndex,
      cellWidth,
      cellHeight,
      config: areaConfig,
      customWidthMap,
      customHeightMap,
      cacheRenderedCellsMap: this.cacheRenderedCellsMap,
      dataRowIndex2TopMap,
      dataColumnIndex2LeftMap,
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

    this.scrollOffsetX = 0;
    this.scrollOffsetY = 0;
  }

  scrollToX(offset = 0) {
    const area = this.areaRef.current;
    const fixedXArea = this.fixedXAreaRef.current;

    // // 更新左右锁定基线
    // const { dynamicalLock } = this.context;
    // if (dynamicalLock) {
    //   this.fixedConfig.scrollRight = offset < 0;
    // }
    if (!area) {
      return;
    }

    const { shouldScroll = () => true } = this.props.areaConfig || {};
    if (!shouldScroll(offset, this.scrollOffsetY)) {
      return;
    }

    if (this.scrollOffsetX === -offset) {
      // 没变化
      return;
    }
    this.scrollDirection = ScrollDirection.X;
    const styles: any = {};
    this._translateDOMPositionXY(styles, (this.scrollOffsetX = -offset), this.scrollOffsetY);
    addStyle(area, styles);

    // fixed列的区域只需要虚拟滚动X方向
    if (fixedXArea) {
      const fixedStyles: any = {};
      this._translateDOMPositionXY(fixedStyles, this.scrollOffsetX, 0);
      addStyle(fixedXArea, fixedStyles);
    }
    this.update(true);
  }

  scrollToY(offset = 0) {
    const area = this.areaRef.current;
    const fixedArea = this.fixedAreaRef.current;
    if (!area && !fixedArea) {
      return;
    }
    this.scrollDirection = ScrollDirection.Y;
    const { shouldScroll = () => true } = this.props.areaConfig || {};
    if (!shouldScroll(this.scrollOffsetX, offset)) {
      return;
    }

    if (this.scrollOffsetY === -offset) {
      // 没变化
      return;
    }

    const styles: any = {};
    this._translateDOMPositionXY(styles, this.scrollOffsetX, (this.scrollOffsetY = -offset));
    addStyle(area, styles);
    // fixed列的区域只需要虚拟滚动Y方向
    if (fixedArea) {
      const fixedStyles: any = {};
      this._translateDOMPositionXY(fixedStyles, 0, this.scrollOffsetY);
      addStyle(fixedArea, fixedStyles);
    }
    this.update(true);
  }

  scrollTo(coord?: { x: number; y: number }) {
    const area = this.areaRef.current;
    const fixedArea = this.fixedAreaRef.current;
    const fixedXArea = this.fixedXAreaRef.current;

    if (!area && !fixedArea) {
      return;
    }

    const { x, y } = coord || { x: 0, y: 0 };
    this.scrollDirection = x !== 0 ? ScrollDirection.X : ScrollDirection.Y;
    const { shouldScroll = () => true } = this.props.areaConfig || {};
    if (!shouldScroll(x, y)) {
      return;
    }

    const styles: any = {};
    this._translateDOMPositionXY(styles, (this.scrollOffsetX = -x), (this.scrollOffsetY = -y));
    addStyle(area, styles);
    // fixed列的区域只需要虚拟滚动Y方向
    if (fixedArea) {
      const fixedStyles: any = {};
      this._translateDOMPositionXY(fixedStyles, 0, this.scrollOffsetY);
      addStyle(fixedArea, fixedStyles);
    }
    // fixed列的区域只需要虚拟滚动X方向
    if (fixedXArea) {
      const fixedStyles: any = {};
      this._translateDOMPositionXY(fixedStyles, this.scrollOffsetX, 0);
      addStyle(fixedXArea, fixedStyles);
    }
    this.update(true);
  }

  getViewStartIndexMap() {
    const { dataRowIndex2TopMap, dataColumnIndex2LeftMap } = this.props;

    const preTop = dataRowIndex2TopMap[this.startY];
    const absScrollOffsetY = Math.abs(this.scrollOffsetY);
    let newStartY = this.startY;
    let newTop = preTop;

    const preLeft = dataColumnIndex2LeftMap[this.startX];
    const absScrollOffsetX = Math.abs(this.scrollOffsetX);
    let newStartX = this.startX;
    let newLeft = preLeft;

    if (preTop > absScrollOffsetY) {
      while (newTop > absScrollOffsetY) {
        newStartY -= 1;
        newTop = dataRowIndex2TopMap[newStartY];
      }
    } else if (preTop < absScrollOffsetY) {
      while (newTop < absScrollOffsetY) {
        newTop = dataRowIndex2TopMap[newStartY + 1];
        if (newTop < absScrollOffsetY) {
          newStartY += 1;
        }
      }
    }

    if (preLeft > absScrollOffsetX) {
      while (newLeft > absScrollOffsetX) {
        newStartX -= 1;
        newLeft = dataColumnIndex2LeftMap[newStartX];
      }
    } else if (preLeft < absScrollOffsetX) {
      while (newLeft < absScrollOffsetX) {
        newLeft = dataColumnIndex2LeftMap[newStartX + 1];
        if (newLeft < absScrollOffsetX) {
          newStartX += 1;
        }
      }
    }

    return {
      viewStartRowIndex: newStartY,
      viewStartColumnIndex: newStartX,
    };
  }

  update(force = false) {
    const {
      data,
      partition,
      cellWidth,
      areaWidth,
      cellHeight,
      areaHeight,
      customWidthMap,
      customHeightMap,
      dataRowIndex2TopMap,
      dataColumnIndex2LeftMap,
      // cellCache,
    } = this.props;
    const { dynamicalLock, dynamicFixedConfig } = this.context;
    const { rowStartIndex, rowEndIndex, colStartIndex, colEndIndex } = partition;
    if (force) {
      this.startX = 0;
      this.endX = 0;
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
      viewStartIndexMap.viewStartRowIndex !== 0
        ? viewStartIndexMap.viewStartRowIndex
        : rowStartIndex,
      dataRowIndex2TopMap,
    );
    const indicesCol = calcSliceIndexes(
      this.scrollOffsetX,
      cellWidth,
      areaWidth,
      colEndIndex,
      colStartIndex,
      customWidthMap,
      viewStartIndexMap.viewStartColumnIndex !== 0
        ? viewStartIndexMap.viewStartColumnIndex
        : colStartIndex,
      dataColumnIndex2LeftMap,
    );

    const { start: startY, end: endY } = indicesRow;
    const { start: startX, end: endX } = indicesCol;
    let fixedDataAndCells = null;
    // 数据区域变化
    if (
      force ||
      startX !== this.startX ||
      endX !== this.endX ||
      startY !== this.startY ||
      endY !== this.endY
    ) {
      this.startX = startX;
      this.endX = endX;
      this.startY = startY;
      this.endY = endY;

      const cellOptions = this.getCellOptions();
      const dataAndCells = sliceDataAndCells(data, indicesRow, indicesCol, cellOptions);
      this.renderData = dataAndCells.renderData;
      this.renderCells = dataAndCells.renderCells;
      const { dynamicalLock } = this.context;
      // 存在锁定开关且存在未锁定列时，切片
      if (dynamicalLock && shouldFixedColsUpdate(this.fixedConfig, this.scrollDirection)) {
        fixedDataAndCells = sliceFixedCellsNew(
          data,
          indicesRow,
          indicesCol,
          cellOptions,
          this.fixedConfig,
          areaWidth,
          areaHeight,
        );
        this.fixedYCells = fixedDataAndCells[0]; // 锁定列且随Y方向滚动
        this.fixedXYCells = fixedDataAndCells[1]; // 锁定列且不随Y方向滚动
        this.fixedXCells = fixedDataAndCells[2];
      }
      this.shouldUpdate = true;
    }
    // 切片锁定列数据
    // console.time('fixed data');
    const cellOptions = this.getCellOptions();
    if (dynamicalLock) {
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
        this.cacheFixedConfig?.leftFixedCount !== this.fixedConfig.leftFixedCount ||
        this.cacheFixedConfig?.rightFixedCount !== this.fixedConfig.rightFixedCount
      ) {
        this.cacheFixedConfig = this.fixedConfig;
        const _fixedDataAndCells =
          // fixedDataAndCells ||
          sliceFixedCellsNew(
            data,
            indicesRow,
            indicesCol,
            cellOptions,
            this.fixedConfig,
            areaWidth,
            areaHeight,
          );
        this.fixedYCells = _fixedDataAndCells[0]; // 锁定列且随Y方向滚动
        this.fixedXYCells = _fixedDataAndCells[1]; // 锁定列且不随Y方向滚动
        this.fixedXCells = _fixedDataAndCells[2];
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

  handleScroll(deltaX: number, deltaY: number) {
    const area = this.areaRef.current;
    const fixedArea = this.fixedAreaRef.current;
    const fixedXArea = this.fixedXAreaRef.current;
    if (!area && !fixedArea) {
      return;
    }
    // const { areaWidth } = this.props;
    const { shouldScroll = () => true } = this.props.areaConfig || {};
    if (!shouldScroll(deltaX - this.scrollOffsetX, deltaY - this.scrollOffsetY)) {
      return;
    }
    this.fixedConfig.scrollRight = deltaX < 0;
    this.scrollDirection = deltaX !== 0 ? ScrollDirection.X : ScrollDirection.Y; // 标识滚动方向
    const styles: any = {};
    this._translateDOMPositionXY(
      styles,
      (this.scrollOffsetX -= deltaX),
      (this.scrollOffsetY -= deltaY),
    );
    addStyle(area, styles);

    // fixed列的区域只需要虚拟滚动Y方向
    if (fixedArea) {
      const fixedStyles: any = {};
      this._translateDOMPositionXY(fixedStyles, 0, this.scrollOffsetY);
      addStyle(fixedArea, fixedStyles);
    }

    // fixed列的区域只需要虚拟滚动X方向
    if (fixedXArea) {
      const fixedStyles: any = {};
      this._translateDOMPositionXY(fixedStyles, this.scrollOffsetX, 0);
      addStyle(fixedXArea, fixedStyles);
    }
    this.update();
  }
  // shouldComponentUpdate(nextProps: DataAreaProps) {
  //   // const compareKeys: Array<keyof DataAreaProps> = [
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
  componentDidUpdate(prevProps: DataAreaProps) {
    const { partition, areaWidth, areaHeight } = this.props;
    const { areaWidth: prevWidth, areaHeight: prevHeight } = prevProps;

    let shouldUpdate = false;
    // 折叠展开引起partition变化
    if (partition !== this.cachedPartition) {
      this.cacheRenderedCellsMap = {};
      this.cachedPartition = partition;
      this.fixedXCells = [];
      this.cacheFixedConfig = {};
      shouldUpdate = true;
    }
    if (areaWidth !== prevWidth || areaHeight !== prevHeight) {
      this.updateDataAndCells();
      this.fixedXCells = [];
      this.cacheFixedConfig = {};
      shouldUpdate = true;
    }
    // 锁定列
    const { dynamicFixedConfig, dynamicalLock } = this.context;
    if (dynamicalLock && dynamicFixedConfig !== this.cachedFixedColsConfig) {
      this.cachedFixedColsConfig = dynamicFixedConfig;
      shouldUpdate = true;
    }
    shouldUpdate && this.update(true);
  }
  componentDidMount() {
    // const { initFixedConfig } = this.context || {};
    // this.fixedConfig = { ...initFixedConfig };
    const { dynamicFixedConfig, dynamicalLock } = this.context;
    if (dynamicalLock) {
      const { customWidthMap, cellWidth, dataColumnIndex2LeftMap, areaWidth, data } = this.props;
      this.fixedConfig = initCalcFixedConfig(
        data,
        dynamicFixedConfig,
        cellWidth,
        customWidthMap,
        dataColumnIndex2LeftMap,
        this.scrollOffsetX,
        false, // 是否向右滚动
        areaWidth,
      );
      this.cacheFixedConfig = this.fixedConfig;
    }
    this.update(true);
  }

  render() {
    const { areaConfig } = this.props;
    this.shouldUpdate = false;
    const { areaRender } = areaConfig || {};
    let content: React.ReactNode | React.ReactNode[];
    let fixedYCells: React.ReactNode[] = [];
    if (typeof areaRender === 'function') {
      content = areaRender(this.renderData);
    } else {
      content = this.renderCells;
    }
    if (this.fixedYCells?.length) {
      fixedYCells = this.fixedYCells; // 动态锁定列且需要跟随滚动
    }
    const { dynamicalLock } = this.context;
    return (
      <div className={`${PREFIX}-data-area`}>
        <div ref={this.areaRef} className={`${PREFIX}-area-container`}>
          {content}
        </div>
        {/* 用于放置行锁定的单元格,容器只在X方向滚动,扩展表格能力，不开启动态锁定也可用 */}
        <div ref={this.fixedXAreaRef} className={`${PREFIX}-fixed-x-area-container`}>
          {this.fixedXCells}
        </div>
        {dynamicalLock && (
          <React.Fragment>
            {/* 用于放置列锁定的单元格,容器只在Y方向滚动 */}
            <div ref={this.fixedAreaRef} className={`${PREFIX}-fixed-y-area-container`}>
              {fixedYCells}
            </div>
            {/* 用于放置行列均锁定的单元格,容器不进行滚动 */}
            <div className={`${PREFIX}-fixed-x-y-area-container`}>{this.fixedXYCells}</div>
          </React.Fragment>
        )}
      </div>
    );
  }
}
