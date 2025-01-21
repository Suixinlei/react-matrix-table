/**
 * Matrix类型定义
 */
import {
  MatrixData,
  CellRender,
  CustomLengthMap,
  MatrixPartition,
  RowHeaderConfig,
  ColHeaderConfig,
  DataAreaConfig,
  CornerAreaConfig,
  RowFooterConfig,
  ColFooterConfig,
  FixedConfig,
  FixedColsConfig,
} from '../types';

export interface ScrollEventLike {
  deltaX: number;
  deltaY: number;
  preventDefault: () => void;
}

export interface MatrixContentSizeProps {
  contentHeight: number;
  contentWidth: number;
}

export interface MatrixTableProps extends React.DOMAttributes<HTMLDivElement> {
  // 表
  data: MatrixData;
  /**
   * 表格高度
   */
  height?: number;
  style?: React.CSSProperties;
  className?: string;

  /**
   * 滚动行为是否为passive，若为true则e.preventDefault()无效，默认为false
   */
  passiveScroll?: boolean;

  // 行
  defaultExpandAllRows?: boolean;
  defaultExpandRowIndexes?: number[];

  // 单元格
  cellWidth?: number;
  cellHeight?: number;
  cellRender?: CellRender;
  cellExtraProps?: React.DOMAttributes<HTMLDivElement>;

  // 分区设置
  rowHeaderConfig?: RowHeaderConfig;
  rowFooterConfig?: RowFooterConfig;
  colHeaderConfig?: ColHeaderConfig;
  colFooterConfig?: ColFooterConfig;
  dataAreaConfig?: DataAreaConfig;
  cornerAreaConfig?: CornerAreaConfig;

  // 动态锁定列开关：
  dynamicLock?: boolean;
  dynamicFixedConfig?: FixedColsConfig;

  // hooks
  shouldUpdateExpandIndexes?: () => boolean;
  // 滚动后的副作用
  scrollAfterEffect?: () => void;

  // 对外事件
  syncScroll?: (offsetX: number, offsetY: number) => void;
  onExpandRow?: (
    rowIndex: number,
    expand: boolean,
    node: Record<string, any>,
  ) => void;
  onExpandRows?: (expandRowIndexMap: Record<string | number, boolean>) => void;
  onScrollTable?: (
    offsetX: number,
    offsetY: number,
    rowIndex: number,
    colIndex: number,
  ) => void;

  // custom
  [key: string]: any;
}

export interface MatrixState extends MatrixPartition, MatrixContentSizeProps {
  width: number;
  /**
   * 收集自定义宽度列map
   */
  customWidthMap: CustomLengthMap;
  /**
   * 收集自定义高度行map
   */
  customHeightMap: CustomLengthMap;
  /**
   * 缓存源data
   */
  cachedData: MatrixData;
  /**
   * 根据源data跳过已收起行后的渲染数据矩阵
   */
  renderData: MatrixData;
  /**
   * 展开/收起行map
   */
  expandRowIndexMap: Record<string | number, boolean>;
  /**
   * 数据行坐标和视图top定位坐标索引
   */
  dataRowIndex2TopMap;
  /**
   * 数据纵坐标和视图left定位坐标索引
   */
  dataColumnIndex2LeftMap;
  /**
   * 初始化动态锁定列的配置
   */
  initFixedConfig: FixedConfig;
}
