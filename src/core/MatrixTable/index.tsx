import React from 'react';
import { debounce, isEqual, omit } from 'lodash';
import bindElementResize, {
  unbind as unbindElementResize,
} from 'element-resize-event';
import cx from 'classnames';
import {
  getWidth,
  requestAnimationFramePolyfill,
  cancelAnimationFramePolyfill,
  addStyle,
} from 'dom-lib';
import CornerArea from '../cornerArea';
import ColHeader from '../colHeader';
import RowHeader from '../rowHeader';
import DataArea from '../dataArea';
import Scrollbar from '../scrollbar';
import { IndexMap } from '../types';
import { ScrollEventLike, MatrixState, MatrixTableProps } from './types';
import { PREFIX, DEFAULT_CELL_HEIGHT, DEFAULT_CELL_WIDTH } from '../constants';
import MatrixContext from './context';
import {
  partition,
  cacheCustomWidth,
  cacheCustomHeight,
  calculateContentSize,
  calcExpandRowIndexMap,
  isValidArea,
} from '../utils/matrix-helper';
import { searchStart } from '../utils/area-helper';

export class MatrixTable extends React.Component<
  MatrixTableProps,
  MatrixState
> {
  static displayName = 'CnEiMatrixTable';

  static defaultProps = {
    height: 300,
    passiveScroll: false,
    cellWidth: DEFAULT_CELL_WIDTH,
    cellHeight: DEFAULT_CELL_HEIGHT,
    dynamicalLock: false,
  };

  static getDerivedStateFromProps(
    nextProps: MatrixTableProps,
    prevState: MatrixState,
  ): MatrixState {
    const {
      data,
      cellWidth,
      cellHeight,
      rowHeaderConfig,
      rowFooterConfig,
      colHeaderConfig,
      colFooterConfig,
      defaultExpandAllRows = true,
      shouldUpdateExpandIndexes = () => true,
      // dataAreaConfig = {},
      // dynamicalLock = false,
    } = nextProps;
    const dataRowIndex2TopMap = {};
    const dataColumnIndex2LeftMap = {};
    if (data !== prevState.cachedData) {
      const renderData = data;
      let expandRowIndexMap = null;
      const shouldUpdateExpand = shouldUpdateExpandIndexes();
      if (shouldUpdateExpand) {
        expandRowIndexMap = calcExpandRowIndexMap(data, defaultExpandAllRows);
      } else {
        expandRowIndexMap = prevState.expandRowIndexMap;
      }
      // if (get(rowHeaderConfig, 'layoutType', 'default') === 'tree') {
      //   renderData = filterExpandedRows(
      //     data,
      //     expandRowIndexMap,
      //     rowHeaderConfig.baseLevel ?? 1,
      //     shouldUpdateExpand && defaultExpandAllRows
      //   );
      // }
      const parsed = partition(
        renderData,
        rowHeaderConfig,
        rowFooterConfig,
        colHeaderConfig,
        colFooterConfig,
      );
      const customWidthMap = cacheCustomWidth(
        renderData,
        dataColumnIndex2LeftMap,
        cellWidth,
        rowHeaderConfig,
        rowFooterConfig,
      );
      const customHeightMap = cacheCustomHeight(
        renderData,
        dataRowIndex2TopMap,
        cellHeight,
        colHeaderConfig,
        colFooterConfig,
      );
      const contentSize = calculateContentSize({
        dataAreaPartition: parsed.dataArea,
        customWidthMap,
        customHeightMap,
        cellWidth,
        cellHeight,
        rowHeaderConfig,
        rowFooterConfig,
        colHeaderConfig,
        colFooterConfig,
      });
      // let initFixedConfig = {};
      // if (dynamicalLock) {
      //   // 计算初始化动态锁定列基线
      //   initFixedConfig = calculateFixedConfig(
      //     data,
      //     dataAreaConfig,
      //     cellWidth,
      //     customWidthMap,
      //     dataColumnIndex2LeftMap,
      //     {
      //       rowHeaderConfig,
      //       rowFooterConfig,
      //       rowHeader: prevState.rowHeader,
      //       rowFooter: prevState.rowFooter,
      //       width: prevState.width,
      //     }
      //   );
      // }
      return {
        ...prevState,
        ...parsed,
        ...contentSize,
        expandRowIndexMap,
        renderData,
        customWidthMap,
        customHeightMap,
        cachedData: data,
        dataRowIndex2TopMap,
        dataColumnIndex2LeftMap,
        // initFixedConfig,
      };
    }

    const customWidthMap = cacheCustomWidth(
      prevState.renderData,
      dataColumnIndex2LeftMap,
      cellWidth,
      rowHeaderConfig,
      rowFooterConfig,
    );
    const customHeightMap = cacheCustomHeight(
      prevState.renderData,
      dataRowIndex2TopMap,
      cellHeight,
      colHeaderConfig,
      colFooterConfig,
    );
    const contentSize = calculateContentSize({
      dataAreaPartition: prevState.dataArea,
      customWidthMap,
      customHeightMap,
      cellWidth,
      cellHeight,
      rowHeaderConfig,
      rowFooterConfig,
      colHeaderConfig,
      colFooterConfig,
    });
    // let initFixedConfig = {};
    // if (dynamicalLock) {
    //   // 计算初始化动态锁定列基线
    //   initFixedConfig = calculateFixedConfig(
    //     data,
    //     dataAreaConfig,
    //     cellWidth,
    //     customWidthMap,
    //     dataColumnIndex2LeftMap,
    //     {
    //       rowHeaderConfig,
    //       rowFooterConfig,
    //       rowHeader: prevState.rowHeader,
    //       rowFooter: prevState.rowFooter,
    //       width: prevState.width,
    //     }
    //   );
    // }
    return {
      ...prevState,
      ...contentSize,
      customWidthMap,
      customHeightMap,
      dataRowIndex2TopMap,
      dataColumnIndex2LeftMap,
      // initFixedConfig,
    };
  }

  // touch
  touchX: number;

  touchY: number;

  // offset
  scrollOffsetX: number;

  scrollOffsetY: number;

  // refs
  tableRef: React.RefObject<HTMLDivElement>;

  tableWrapperRef: React.RefObject<HTMLDivElement>;

  colHeaderRef: React.RefObject<ColHeader>;

  colFooterRef: React.RefObject<ColHeader>;

  rowHeaderRef: React.RefObject<RowHeader>;

  rowFooterRef: React.RefObject<RowHeader>;

  dataAreaRef: React.RefObject<DataArea>;

  scrollbarXRef: React.RefObject<Scrollbar>;

  scrollbarYRef: React.RefObject<Scrollbar>;

  scrollStartTimeout: number;

  scrollEndTimeout: number;

  isScrolling: boolean;

  dataAreaStartY: number;

  dataAreaStartX: number;

  rendered: boolean;

  constructor(props: MatrixTableProps) {
    super(props);
    // touch
    this.touchX = 0;
    this.touchY = 0;
    // offset
    this.scrollOffsetX = 0;
    this.scrollOffsetY = 0;
    // refs
    this.tableRef = React.createRef();
    this.tableWrapperRef = React.createRef();
    this.colHeaderRef = React.createRef();
    this.colFooterRef = React.createRef();
    this.rowHeaderRef = React.createRef();
    this.rowFooterRef = React.createRef();
    this.dataAreaRef = React.createRef();
    this.scrollbarXRef = React.createRef();
    this.scrollbarYRef = React.createRef();
    this.isScrolling = false;

    const getDefaultPartition = (): IndexMap => ({
      rowStartIndex: -1,
      rowEndIndex: -1,
      colStartIndex: -1,
      colEndIndex: -1,
    });

    this.state = {
      // size
      width: 300,
      contentWidth: 0,
      contentHeight: 0,
      customWidthMap: {},
      customHeightMap: {},
      // area
      cachedData: null,
      renderData: [],
      cornerTopLeft: getDefaultPartition(),
      colHeader: getDefaultPartition(),
      cornerTopRight: getDefaultPartition(),
      rowHeader: getDefaultPartition(),
      dataArea: getDefaultPartition(),
      rowFooter: getDefaultPartition(),
      cornerBottomLeft: getDefaultPartition(),
      colFooter: getDefaultPartition(),
      cornerBottomRight: getDefaultPartition(),
      // expand
      expandRowIndexMap: {},
      dataRowIndex2TopMap: {},
      dataColumnIndex2LeftMap: {},
      // fixed
      initFixedConfig: {},
    };

    this.handleWheel = this.handleWheel.bind(this);
    this.handleWheelEnd = this.handleWheelEnd.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
  }

  componentDidMount() {
    this.getTableWidth();
    const table = this.tableRef.current;
    const tableWrapper = this.tableWrapperRef.current;
    bindElementResize(
      table,
      debounce(() => {
        this.getTableWidth();
      }, 400),
    );

    const option = { passive: this.props.passiveScroll };
    tableWrapper.addEventListener('wheel', this.handleWheel as any, option);
    tableWrapper.addEventListener(
      'touchstart',
      this.handleTouchStart as any,
      option,
    );
    tableWrapper.addEventListener(
      'touchmove',
      this.handleTouchMove as any,
      option,
    );
  }

  shouldComponentUpdate(nextProps: MatrixTableProps, nextState: MatrixState) {
    const simplePropKeys: Array<keyof MatrixTableProps> = [
      'data',
      'height',
      'className',
      'passiveScroll',
      'syncScroll',
      'scrollAfterEffect',
      'defaultExpandAllRows',
      'defaultExpandRowIndexes',
      'cellWidth',
      'cellHeight',
      'cellRender',
      'shouldUpdateExpandIndexes',
    ];
    const deepPropKeys: Array<keyof MatrixTableProps> = [
      'style',
      'rowHeaderConfig',
      'rowFooterConfig',
      'colHeaderConfig',
      'colFooterConfig',
      'dataAreaConfig',
      'cornerAreaConfig',
    ];
    const comparePropKeys = [].concat(simplePropKeys, deepPropKeys);
    const simpleStateKeys: Array<keyof MatrixState> = [
      'contentHeight',
      'contentWidth',
      'width',
      'renderData',
      'expandRowIndexMap',
      'initFixedConfig',
    ];
    const deepStateKeys: Array<keyof MatrixState> = [
      'cornerTopLeft',
      'colHeader',
      'cornerTopRight',
      'rowHeader',
      'dataArea',
      'rowFooter',
      'cornerBottomLeft',
      'colFooter',
      'cornerBottomRight',
    ];
    const compareStateKeys = [].concat(simpleStateKeys, deepStateKeys);
    const curProps = this.props;
    const curState = this.state;

    return (
      comparePropKeys.some((key) => {
        const cur = curProps[key];
        const next = nextProps[key];
        return deepPropKeys.includes(key) ? !isEqual(cur, next) : cur !== next;
      }) ||
      compareStateKeys.some((key) => {
        const cur = curState[key];
        const next = nextState[key];
        return deepStateKeys.includes(key) ? !isEqual(cur, next) : cur !== next;
      })
    );
  }

  componentWillUnmount() {
    const table = this.tableRef.current;
    const tableWrapper = this.tableWrapperRef.current;
    if (table) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      unbindElementResize(table);
    }
    if (tableWrapper) {
      tableWrapper.removeEventListener('wheel', this.handleWheel as any);
      tableWrapper.removeEventListener(
        'touchstart',
        this.handleTouchStart as any,
      );
      tableWrapper.removeEventListener(
        'touchmove',
        this.handleTouchMove as any,
      );
    }
  }

  scrollToX(offset = 0) {
    const table = this.tableRef.current;
    addStyle(table, { pointerEvents: 'none' });
    this.scrollOffsetX = offset;
    /* eslint-disable no-unused-expressions */
    this.colHeaderRef.current?.scrollToX(offset);
    this.colFooterRef.current?.scrollToX(offset);
    this.dataAreaRef.current?.scrollToX(offset);
    this.scrollbarXRef.current?.resetScrollBarPosition(offset);
    /* eslint-enable no-unused-expressions */

    // 滚动副作用
    const { scrollAfterEffect } = this.props;
    if (typeof scrollAfterEffect === 'function') {
      scrollAfterEffect();
    }

    setTimeout(() => addStyle(table, { pointerEvents: 'unset' }), 160);
  }

  scrollToY(offset = 0) {
    const table = this.tableRef.current;
    addStyle(table, { pointerEvents: 'none' });
    this.scrollOffsetY = offset;
    /* eslint-disable no-unused-expressions */
    this.rowHeaderRef.current?.scrollToY(offset);
    this.rowFooterRef.current?.scrollToY(offset);
    this.dataAreaRef.current?.scrollToY(offset);
    this.scrollbarYRef.current?.resetScrollBarPosition(offset);
    /* eslint-enable no-unused-expressions */
    setTimeout(() => addStyle(table, { pointerEvents: 'unset' }), 160);
  }

  scrollToRow(rowIndex = 0, scrollIntoView = false) {
    const { height, cellHeight, colHeaderConfig, colFooterConfig } = this.props;
    const { contentHeight, renderData } = this.state;
    if (contentHeight <= height) {
      // 内容高度不足，无法滚动
      return;
    }

    const headerLength = colHeaderConfig?.length ?? 0;

    let heightBefore = 0;
    // height before target
    for (let i = headerLength; i < rowIndex; i++) {
      heightBefore += renderData[i]?.[0]?.height || cellHeight;
    }
    // col header height
    let colHeaderHeight = 0;
    for (let i = 0; i < headerLength; i++) {
      colHeaderHeight +=
        renderData[i]?.[0]?.height || colHeaderConfig?.cellHeight || cellHeight;
    }
    // col footer height
    let colFooterHeight = 0;
    for (let i = colFooterConfig?.length ?? 0; i > 0; i--) {
      colFooterHeight +=
        renderData[renderData.length - i]?.[0]?.height ||
        colFooterConfig?.cellHeight ||
        cellHeight;
    }
    const curCellHeight = renderData[rowIndex]?.[0]?.height || cellHeight;
    if (scrollIntoView) {
      const { scrollOffsetY } = this;
      // target处于可见区域底部时的剩余高度
      const heightForIntoView =
        height - colHeaderHeight - colFooterHeight - curCellHeight;
      if (scrollOffsetY > heightBefore) {
        // target在可见区域上方
        this.scrollToY(heightBefore);
      } else if (heightBefore - scrollOffsetY > heightForIntoView) {
        // target在可见区域下方
        this.scrollToY(heightBefore - heightForIntoView);
      }
    } else {
      // height after target
      let heightAfter = -colFooterHeight;
      for (let i = rowIndex + 1; i < renderData.length; i++) {
        heightAfter += renderData[i]?.[0]?.height || cellHeight;
      }
      const tableAreaHeight = height - colHeaderHeight - colFooterHeight;
      const restHeight = tableAreaHeight - curCellHeight - heightAfter;
      if (restHeight > 0) {
        // 说明此时底部会有空白，需要进行补正
        this.scrollToY(heightBefore - restHeight);
      } else {
        this.scrollToY(heightBefore);
      }
    }
  }

  scrollToColumn(
    colIndex = 0,
    scrollIntoViewOrOffset: boolean | number = false,
  ) {
    const { cellWidth, rowHeaderConfig, rowFooterConfig } = this.props;
    const { width, contentWidth, renderData } = this.state;
    if (contentWidth <= width) {
      // 内容宽度不足，无法滚动
      return;
    }

    const headerLength = rowHeaderConfig?.length ?? 0;

    let widthBefore = 0;
    // width before target
    for (let i = headerLength; i < colIndex; i++) {
      widthBefore += renderData[0]?.[i]?.width || cellWidth;
    }
    // row header width
    let rowHeaderWidth = 0;
    for (let i = 0; i < headerLength; i++) {
      rowHeaderWidth +=
        renderData[0]?.[i]?.width || rowHeaderConfig?.cellWidth || cellWidth;
    }
    // row footer width
    let rowFooterWidth = 0;
    for (let i = rowFooterConfig?.length ?? 0; i > 0; i--) {
      rowFooterWidth +=
        renderData[0]?.[renderData[0].length - i]?.width ||
        rowFooterConfig?.cellWidth ||
        cellWidth;
    }
    const curCellWidth = renderData[0]?.[colIndex]?.width || cellWidth;
    if (typeof scrollIntoViewOrOffset === 'boolean' && scrollIntoViewOrOffset) {
      const { scrollOffsetX } = this;
      // target处于可见区域右侧时的剩余宽度
      const widthForIntoView =
        width - rowHeaderWidth - rowFooterWidth - curCellWidth;
      if (scrollOffsetX > widthBefore) {
        // target在可见区域左方
        this.scrollToX(widthBefore);
      } else if (widthBefore - scrollOffsetX > widthForIntoView) {
        // target在可见区域右方
        this.scrollToX(widthBefore - widthForIntoView);
      }
    } else {
      // width after target
      let widthAfter = -rowFooterWidth;
      for (let i = colIndex + 1; i < renderData[0]?.length ?? 0; i++) {
        widthAfter += renderData[0]?.[i]?.width || cellWidth;
      }
      const tableAreaWidth = width - rowHeaderWidth - rowFooterWidth;
      const restWidth =
        tableAreaWidth - +scrollIntoViewOrOffset - curCellWidth - widthAfter;
      if (restWidth > 0) {
        // 说明此时右侧会有空白，需要进行补正
        this.scrollToX(widthBefore - restWidth);
      } else {
        this.scrollToX(widthBefore - +scrollIntoViewOrOffset);
      }
    }
  }

  /**
   * 将滚动区滚动到坐标coord
   * 坐标计算以dataArea左上角作为原点
   * @param coord
   */
  scrollTo(coord?: { x: number; y: number }) {
    const { x, y } = coord || { x: 0, y: 0 };

    this.scrollOffsetX = x;
    this.scrollOffsetY = y;
    /* eslint-disable no-unused-expressions */
    this.colHeaderRef.current?.scrollToX(x);
    this.colFooterRef.current?.scrollToX(x);
    this.rowHeaderRef.current?.scrollToY(y);
    this.rowFooterRef.current?.scrollToY(y);
    this.dataAreaRef.current?.scrollTo(coord);
    this.scrollbarXRef.current?.resetScrollBarPosition(x);
    this.scrollbarYRef.current?.resetScrollBarPosition(y);
    /* eslint-enable no-unused-expressions */
    // 滚动副作用
    const { scrollAfterEffect } = this.props;
    if (typeof scrollAfterEffect === 'function') {
      scrollAfterEffect();
    }
  }

  expandRow(rowIndex: number, expand: boolean, node: Record<string, any>) {
    this.clearRenderedMap();
    const { onExpandRow } = this.props;
    const { expandRowIndexMap } = this.state;
    expandRowIndexMap[rowIndex] = expand;
    this.updateByExpand(expandRowIndexMap);
    if (typeof onExpandRow === 'function') {
      onExpandRow(rowIndex, expand, node);
    }
  }

  clearRenderedMap() {
    this.colHeaderRef.current.cacheRenderedCellsMap = {};
    this.colFooterRef.current.cacheRenderedCellsMap = {};
    this.rowHeaderRef.current.cacheRenderedCellsMap = {};
    this.rowFooterRef.current.cacheRenderedCellsMap = {};
    this.dataAreaRef.current.cacheRenderedCellsMap = {};
  }

  /**
   * 批量展开/收起行
   * @param rowIndexes 要展开/收起的行坐标
   * @param expand 展开/收起
   */
  expandRows(rowIndexes: number[], expand = true) {
    const { onExpandRows } = this.props;
    const { expandRowIndexMap } = this.state;
    rowIndexes.forEach((index) => {
      expandRowIndexMap[index] = expand;
    });
    this.updateByExpand(expandRowIndexMap);
    if (typeof onExpandRows === 'function') {
      onExpandRows(expandRowIndexMap);
    }
  }

  /**
   * 通过indexMap的方式批量设置行的展开/收起状态
   */
  expandRowsByMap(
    rowIndexMap: Record<string | number, boolean>,
    override = true,
  ) {
    const { onExpandRows } = this.props;
    if (override) {
      this.updateByExpand(rowIndexMap);
    } else {
      this.updateByExpand({ ...this.state.expandRowIndexMap, ...rowIndexMap });
    }
    if (typeof onExpandRows === 'function') {
      onExpandRows(rowIndexMap);
    }
  }

  updateByExpand(expandRowIndexMap: Record<string | number, boolean>) {
    // const { customWidthMap, customHeightMap } = this.state;

    const {
      data,
      cellWidth,
      cellHeight,
      rowHeaderConfig,
      rowFooterConfig,
      colHeaderConfig,
      colFooterConfig,
    } = this.props;
    if (rowHeaderConfig?.layoutType === 'tree') {
      const renderData = data;

      // const renderData = filterExpandedRows(
      //   data,
      //   expandRowIndexMap,
      //   rowHeaderConfig.baseLevel
      // );

      const parsed = partition(
        renderData,
        rowHeaderConfig,
        rowFooterConfig,
        colHeaderConfig,
        colFooterConfig,
      );

      const dataColumnIndex2LeftMap = {};
      const dataRowIndex2TopMap = {};
      const customWidthMap = cacheCustomWidth(
        renderData,
        dataColumnIndex2LeftMap,
        cellWidth,
        rowHeaderConfig,
        rowFooterConfig,
      );
      const customHeightMap = cacheCustomHeight(
        renderData,
        dataRowIndex2TopMap,
        cellHeight,
        colHeaderConfig,
        colFooterConfig,
      );

      const contentSize = calculateContentSize({
        dataAreaPartition: parsed.dataArea,
        customWidthMap,
        customHeightMap,
        cellWidth,
        cellHeight,
        rowHeaderConfig,
        rowFooterConfig,
        colHeaderConfig,
        colFooterConfig,
      });

      this.setState({
        ...parsed,
        ...contentSize,
        renderData,
        expandRowIndexMap,
        dataColumnIndex2LeftMap,
        dataRowIndex2TopMap,
      });
    }
  }

  getTableWidth() {
    const table = this.tableRef.current;
    const { width } = this.state;
    if (table) {
      const nextWidth = getWidth(table);
      if (nextWidth !== width) {
        this.setState({ width: nextWidth });
      }
    }
  }

  resetOffset() {
    this.scrollOffsetX = 0;
    this.scrollOffsetY = 0;
    /* eslint-disable no-unused-expressions */
    this.colHeaderRef.current?.resetOffset();
    this.colFooterRef.current?.resetOffset();
    this.rowHeaderRef.current?.resetOffset();
    this.rowFooterRef.current?.resetOffset();
    this.dataAreaRef.current?.resetOffset();
    this.scrollbarXRef.current?.resetScrollBarPosition();
    this.scrollbarYRef.current?.resetScrollBarPosition();
    /* eslint-enable no-unused-expressions */
  }

  handleTouchStart(event: React.TouchEvent) {
    if (event.touches) {
      const { pageX, pageY } = event.touches[0];
      this.touchX = pageX;
      this.touchY = pageY;
    }
  }

  handleTouchMove(event: React.TouchEvent) {
    if (event.touches) {
      const { pageX, pageY } = event.touches[0];
      const deltaX = this.touchX - pageX;
      const deltaY = this.touchY - pageY;
      this.touchX = pageX;
      this.touchY = pageY;

      this.handleWheel({
        deltaX,
        deltaY,
        preventDefault: event.preventDefault.bind(event),
      });
    }
  }

  handleScrollX(delta: number) {
    if (this.scrollEndTimeout) {
      clearTimeout(this.scrollEndTimeout);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.scrollEndTimeout = setTimeout(this.handleWheelEnd, 160);

    const { contentWidth, width } = this.state;
    if (contentWidth <= width || !delta) {
      return;
    }
    const calcOffsetX = this.scrollOffsetX + delta;
    const maxOffsetX = contentWidth - width;
    let nextOffsetX = 0;
    // min
    nextOffsetX = calcOffsetX < 0 ? 0 : calcOffsetX;
    // max
    nextOffsetX = nextOffsetX > maxOffsetX ? maxOffsetX : nextOffsetX;

    if (this.scrollOffsetX === nextOffsetX) {
      return;
    }
    const limitedDelta = nextOffsetX - this.scrollOffsetX;
    this.scrollOffsetX = nextOffsetX;

    this.isScrolling = true;
    /* eslint-disable no-unused-expressions */
    this.colHeaderRef.current?.handleScroll(limitedDelta);
    this.dataAreaRef.current?.handleScroll(limitedDelta, 0);
    this.colFooterRef.current?.handleScroll(limitedDelta);
    this.scrollbarXRef.current?.onWheelScroll(limitedDelta);

    const { syncScroll } = this.props;
    if (typeof syncScroll === 'function') {
      syncScroll(delta, 0);
    }

    // const dataAreaStartX = this.dataAreaRef.current.startX;
    // if (dataAreaStartX !== this.dataAreaStartX) {
    //   this.forceUpdate();
    // }
    // this.dataAreaStartX = dataAreaStartX;
    /* eslint-enable no-unused-expressions */
  }

  handleScrollY(delta: number) {
    if (this.scrollEndTimeout) {
      clearTimeout(this.scrollEndTimeout);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.scrollEndTimeout = setTimeout(this.handleWheelEnd, 160);

    const { height } = this.props;
    const { contentHeight } = this.state;
    if (contentHeight <= height || !delta) {
      return;
    }
    const calcOffsetY = this.scrollOffsetY + delta;
    const maxOffsetY = contentHeight - height;
    let nextOffsetY = 0;
    // min
    nextOffsetY = calcOffsetY < 0 ? 0 : calcOffsetY;
    // max
    nextOffsetY = nextOffsetY > maxOffsetY ? maxOffsetY : nextOffsetY;

    if (this.scrollOffsetY === nextOffsetY) {
      return;
    }

    const limitedDelta = nextOffsetY - this.scrollOffsetY;
    this.scrollOffsetY = nextOffsetY;

    this.isScrolling = true;
    /* eslint-disable no-unused-expressions */
    this.rowHeaderRef.current?.handleScroll(limitedDelta);
    this.dataAreaRef.current?.handleScroll(0, limitedDelta);
    this.rowFooterRef.current?.handleScroll(limitedDelta);
    this.scrollbarYRef.current?.onWheelScroll(limitedDelta);

    const { syncScroll } = this.props;
    if (typeof syncScroll === 'function') {
      syncScroll(0, delta);
    }

    // const dataAreaStartY = this.dataAreaRef.current?.startY;
    // if (dataAreaStartY !== this.dataAreaStartY) {
    //   this.forceUpdate();
    // }
    // this.dataAreaStartY = dataAreaStartY;
    /* eslint-enable no-unused-expressions */
  }

  renderScrollbar() {
    const { height } = this.props;
    const { contentWidth, contentHeight, width } = this.state;

    return (
      <>
        <Scrollbar
          ref={this.scrollbarXRef}
          length={width - 2}
          scrollLength={contentWidth}
          onScroll={this.handleScrollX.bind(this)}
        />
        <Scrollbar
          ref={this.scrollbarYRef}
          vertical
          length={height - 2}
          scrollLength={contentHeight}
          onScroll={this.handleScrollY.bind(this)}
        />
      </>
    );
  }

  componentDidUpdate(prevProps: MatrixTableProps, prevState: MatrixState) {
    const { contentHeight: prevHeight, contentWidth: prevWidth } = prevState;
    const {
      width,
      contentHeight: curHeight,
      contentWidth: curWidth,
    } = this.state;
    const { height } = this.props;

    if (prevHeight > curHeight) {
      if (this.scrollOffsetY + height > curHeight) {
        const diff = prevHeight - curHeight;
        this.scrollToY(Math.max(this.scrollOffsetY - diff, 0));
      }
    }
    if (prevWidth > curWidth) {
      if (this.scrollOffsetX + width > curWidth) {
        const diff = prevWidth - curWidth;
        this.scrollToX(Math.max(this.scrollOffsetX - diff, 0));
      }
    }
  }

  handleWheel(e: ScrollEventLike) {
    if (!this.props.passiveScroll) {
      e.preventDefault();
    }

    if (!this.isScrolling) {
      const style: React.CSSProperties = {
        pointerEvents: 'none',
      };
      addStyle(this.tableRef.current, style);
    }
    this.isScrolling = true;

    const { deltaX, deltaY } = e;

    // 单次只滚动偏移较大的方向
    const _deltaX = Math.abs(deltaX);
    const _deltaY = Math.abs(deltaY);

    if (_deltaY >= _deltaX) {
      if (this.scrollStartTimeout) {
        cancelAnimationFramePolyfill(this.scrollStartTimeout);
      }
      this.scrollStartTimeout = requestAnimationFramePolyfill(() => {
        this.handleScrollY(deltaY);
        // 滚动副作用
        const { scrollAfterEffect } = this.props;
        if (typeof scrollAfterEffect === 'function') {
          scrollAfterEffect();
        }
        this.scrollStartTimeout = null;
      });
    } else if (_deltaX > _deltaY) {
      if (this.scrollStartTimeout) {
        cancelAnimationFramePolyfill(this.scrollStartTimeout);
      }
      this.scrollStartTimeout = requestAnimationFramePolyfill(() => {
        this.handleScrollX(deltaX);
        // 滚动副作用
        const { scrollAfterEffect } = this.props;
        if (typeof scrollAfterEffect === 'function') {
          scrollAfterEffect();
        }
        this.scrollStartTimeout = null;
      });
    }
  }

  handleWheelEnd() {
    const table = this.tableRef.current;
    this.isScrolling = false;
    if (table) {
      const style: React.CSSProperties = {
        pointerEvents: 'unset',
      };
      addStyle(table, style);
    }
    const { onScrollTable } = this.props;
    if (typeof onScrollTable === 'function') {
      const { cellWidth, cellHeight } = this.props;
      const { dataRowIndex2TopMap, dataColumnIndex2LeftMap, dataArea } =
        this.state;
      const { rowStartIndex, rowEndIndex, colStartIndex, colEndIndex } =
        dataArea;
      const curRow = searchStart(
        dataRowIndex2TopMap,
        Math.abs(this.scrollOffsetY),
        rowStartIndex,
        rowEndIndex,
        cellHeight,
      );
      const curCol = searchStart(
        dataColumnIndex2LeftMap,
        Math.abs(this.scrollOffsetX),
        colStartIndex,
        colEndIndex,
        cellWidth,
      );
      onScrollTable(this.scrollOffsetX, this.scrollOffsetY, curRow, curCol);
    }
  }

  render() {
    const {
      data,
      height,
      style: propStyle,
      className: propClassName,
      cellWidth,
      cellHeight,
      cellRender,
      cellExtraProps,
      cornerAreaConfig,
      colHeaderConfig,
      colFooterConfig,
      rowHeaderConfig,
      rowFooterConfig,
      dataAreaConfig,
      dynamicalLock,
      dynamicFixedConfig,
      cellCache = false,
      ...rest
    } = this.props;
    const {
      renderData,
      width,
      expandRowIndexMap,
      customWidthMap,
      customHeightMap,
      cornerTopLeft,
      colHeader,
      cornerTopRight,
      rowHeader,
      dataArea,
      rowFooter,
      cornerBottomLeft,
      colFooter,
      cornerBottomRight,
      dataRowIndex2TopMap,
      dataColumnIndex2LeftMap,
      initFixedConfig,
    } = this.state;
    const style = {
      ...propStyle,
      height,
    };

    const rowHeaderCellWidth = rowHeaderConfig?.cellWidth || cellWidth;
    const rowFooterCellWidth = rowFooterConfig?.cellWidth || cellWidth;
    const colHeaderCellHeight = colHeaderConfig?.cellHeight || cellHeight;
    const colFooterCellHeight = colFooterConfig?.cellHeight || cellHeight;

    const rowHeaderWidth =
      (rowHeader.colEndIndex - rowHeader.colStartIndex) * rowHeaderCellWidth;
    const rowFooterWidth =
      (rowFooter.colEndIndex - rowFooter.colStartIndex) * rowFooterCellWidth;
    const colHeaderHeight =
      (colHeader.rowEndIndex - colHeader.rowStartIndex) * colHeaderCellHeight;
    const colFooterHeight =
      (colFooter.rowEndIndex - colFooter.rowStartIndex) * colFooterCellHeight;

    const customProps = omit(rest, [
      'data',
      'defaultExpandAllRows',
      'defaultExpandRowIndexes',
      'syncScroll',
      'passiveScroll',
      'onExpandRow',
      'onExpandRows',
      'onScrollTable',
      'shouldUpdateExpandIndexes',
      'scrollAfterEffect', // 滚动后执行的副作用
    ]);
    return (
      <MatrixContext.Provider
        value={{
          data,
          cellRender,
          cellExtraProps,
          expandRowIndexMap,
          expandRow: this.expandRow.bind(this),
          customWidthMap,
          customHeightMap,
          initFixedConfig,
          dynamicalLock, // 动态锁定列开关
          dynamicFixedConfig,
        }}
      >
        <div ref={this.tableWrapperRef} className={`${PREFIX}-wrapper`}>
          <div
            ref={this.tableRef}
            className={cx(PREFIX, propClassName)}
            style={style}
            {...customProps}
          >
            <div className={`${PREFIX}-row`}>
              {isValidArea(cornerTopLeft) ? (
                <CornerArea
                  key='CornerAreaTopLeft'
                  data={renderData}
                  cornerType='topLeft'
                  partition={cornerTopLeft}
                  areaConfig={cornerAreaConfig}
                  cellWidth={rowHeaderCellWidth}
                  cellHeight={colHeaderCellHeight}
                  customWidthMap={customWidthMap}
                  customHeightMap={customHeightMap}
                  dataRowIndex2TopMap={dataRowIndex2TopMap}
                  dataColumnIndex2LeftMap={dataColumnIndex2LeftMap}
                  cellCache={cellCache}
                />
              ) : (
                ''
              )}

              {isValidArea(colHeader) ? (
                <ColHeader
                  key='ColHeader'
                  ref={this.colHeaderRef}
                  data={renderData}
                  partition={colHeader}
                  areaConfig={colHeaderConfig}
                  cellWidth={cellWidth}
                  cellHeight={colHeaderCellHeight}
                  areaWidth={width - rowHeaderWidth - rowFooterWidth}
                  customWidthMap={customWidthMap}
                  customHeightMap={customHeightMap}
                  dataRowIndex2TopMap={dataRowIndex2TopMap}
                  dataColumnIndex2LeftMap={dataColumnIndex2LeftMap}
                  cellCache={cellCache}
                />
              ) : (
                ''
              )}

              {isValidArea(cornerTopRight) ? (
                <CornerArea
                  key='CornerAreaTopRight'
                  data={renderData}
                  cornerType='topRight'
                  partition={cornerTopRight}
                  areaConfig={cornerAreaConfig}
                  cellWidth={rowFooterCellWidth}
                  cellHeight={colHeaderCellHeight}
                  customWidthMap={customWidthMap}
                  customHeightMap={customHeightMap}
                  dataRowIndex2TopMap={dataRowIndex2TopMap}
                  dataColumnIndex2LeftMap={dataColumnIndex2LeftMap}
                  cellCache={cellCache}
                />
              ) : (
                ''
              )}
            </div>
            <div className={`${PREFIX}-row-body`}>
              {isValidArea(rowHeader) ? (
                <RowHeader
                  key='RowHeader'
                  ref={this.rowHeaderRef}
                  data={renderData}
                  partition={rowHeader}
                  areaConfig={rowHeaderConfig}
                  cellWidth={rowHeaderCellWidth}
                  cellHeight={cellHeight}
                  areaHeight={height - colHeaderHeight - colFooterHeight}
                  customWidthMap={customWidthMap}
                  customHeightMap={customHeightMap}
                  dataRowIndex2TopMap={dataRowIndex2TopMap}
                  dataColumnIndex2LeftMap={dataColumnIndex2LeftMap}
                  cellCache={cellCache}
                />
              ) : (
                ''
              )}

              {isValidArea(dataArea) ? (
                <DataArea
                  key='DataArea'
                  ref={this.dataAreaRef}
                  data={renderData}
                  partition={dataArea}
                  areaConfig={dataAreaConfig}
                  cellWidth={cellWidth}
                  cellHeight={cellHeight}
                  areaWidth={width - rowHeaderWidth - rowFooterWidth}
                  areaHeight={height - colHeaderHeight - colFooterHeight}
                  customWidthMap={customWidthMap}
                  customHeightMap={customHeightMap}
                  dataRowIndex2TopMap={dataRowIndex2TopMap}
                  dataColumnIndex2LeftMap={dataColumnIndex2LeftMap}
                  cellCache={cellCache}
                />
              ) : (
                ''
              )}

              {isValidArea(rowFooter) ? (
                <RowHeader
                  key='RowFooter'
                  ref={this.rowFooterRef}
                  data={renderData}
                  partition={rowFooter}
                  areaConfig={rowFooterConfig}
                  cellWidth={rowFooterCellWidth}
                  cellHeight={cellHeight}
                  areaHeight={height - colHeaderHeight - colFooterHeight}
                  customWidthMap={customWidthMap}
                  customHeightMap={customHeightMap}
                  dataRowIndex2TopMap={dataRowIndex2TopMap}
                  dataColumnIndex2LeftMap={dataColumnIndex2LeftMap}
                  cellCache={cellCache}
                />
              ) : (
                ''
              )}
            </div>
            <div className={`${PREFIX}-row`}>
              {isValidArea(cornerBottomLeft) ? (
                <CornerArea
                  key='CornerAreaBottomLeft'
                  data={renderData}
                  cornerType='bottomLeft'
                  partition={cornerBottomLeft}
                  areaConfig={cornerAreaConfig}
                  cellWidth={rowHeaderCellWidth}
                  cellHeight={colFooterCellHeight}
                  customWidthMap={customWidthMap}
                  customHeightMap={customHeightMap}
                  dataRowIndex2TopMap={dataRowIndex2TopMap}
                  dataColumnIndex2LeftMap={dataColumnIndex2LeftMap}
                  cellCache={cellCache}
                />
              ) : (
                ''
              )}

              {isValidArea(colFooter) ? (
                <ColHeader
                  key='ColHeader'
                  ref={this.colFooterRef}
                  data={renderData}
                  partition={colFooter}
                  areaConfig={colFooterConfig}
                  cellWidth={cellWidth}
                  cellHeight={colFooterCellHeight}
                  areaWidth={width - rowHeaderWidth - rowFooterWidth}
                  customWidthMap={customWidthMap}
                  customHeightMap={customHeightMap}
                  dataRowIndex2TopMap={dataRowIndex2TopMap}
                  dataColumnIndex2LeftMap={dataColumnIndex2LeftMap}
                  cellCache={cellCache}
                />
              ) : (
                ''
              )}

              {isValidArea(colFooter) ? (
                <CornerArea
                  key='CornerAreaBottomRight'
                  data={renderData}
                  cornerType='bottomRight'
                  partition={cornerBottomRight}
                  areaConfig={cornerAreaConfig}
                  cellWidth={rowFooterCellWidth}
                  cellHeight={colFooterCellHeight}
                  customWidthMap={customWidthMap}
                  customHeightMap={customHeightMap}
                  dataRowIndex2TopMap={dataRowIndex2TopMap}
                  dataColumnIndex2LeftMap={dataColumnIndex2LeftMap}
                  cellCache={cellCache}
                />
              ) : (
                ''
              )}
            </div>
            {this.renderScrollbar()}
          </div>
        </div>
      </MatrixContext.Provider>
    );
  }
}
