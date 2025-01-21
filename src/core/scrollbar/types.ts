/**
 * 滚动条类型定义
 */


export interface Offset {
  top: number;
  left: number;
  height?: number;
  width?: number;
}

export interface ScrollbarProps {
  vertical?: boolean;
  length: number;
  scrollLength: number;
  className?: string;
  tableId?: string;
  onScroll?: (delta: number, event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  [key: string]: any;
}

export interface ScrollbarState {
  barOffset: Offset;
  handlePressed: boolean;
}
