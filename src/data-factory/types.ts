/**
 * 原始行头属性
 */
export interface IOriginalRowHeader {
  /**
   * 唯一 id
   */
  id: string;
  /**
   * 行头名称
   */
  name: string;
  /**
   * 数据坐标-行
   */
  dataRowIndex: number;
  /**
   * 层级
   */
  level: number;
  /**
   * 默认是否展开
   */
  defaultExpand: boolean;
  /**
   * 默认是否展示
   */
  defaultDisplay: boolean;
  /**
   * 父层级
   */
  parent: string;

  [key: string]: unknown;
}

/**
 * 原始列头属性
 */
export interface IOriginalColHeader {
  /**
   * 唯一 id
   */
  id: string;
  /**
   * 行头名称
   */
  name: string;
  /**
   * 数据坐标-列
   */
  dataColIndex: number;
  /**
   * 层级
   */
  level: number;
  /**
   * 默认是否展开
   */
  defaultExpand: boolean;
  /**
   * 默认是否展示
   */
  defaultDisplay: boolean;
  /**
   * 父层级
   */
  parent: string;

  [key: string]: unknown;
}

// 原始树形行头
export type IOriginalRowTreeItem = IOriginalRowHeader & {
  children?: IOriginalRowTreeItem[];
};

// 原始树形列头
export type IOriginalColTreeItem = IOriginalColHeader & {
  children?: IOriginalRowTreeItem[];
};

// 树形行头
export type IRowTreeItem = Omit<IOriginalRowHeader, 'defaultDisplay'> & {
  children?: IRowTreeItem[];
};

// 树形列头
export type IColTreeItem = Omit<IOriginalColHeader, 'defaultDisplay'> & {
  children?: IColTreeItem[];
};

export type INumberFormatConditionClassName =
  | 'normal'
  | 'bold'
  | 'notice-normal'
  | 'notice-bold'
  | 'success-normal'
  | 'success-bold'
  | 'error-normal'
  | 'error-bold';

// 普通条件格式
export interface INumberFormatCommonCondition {
  /**
   * 类型
   */
  type: 'common';
  /**
   * 添加的样式种类
   */
  value: INumberFormatConditionClassName;
}

/**
 * 自定义条件格式判断的条件
 */
export interface INumberFormatCustomConditionCondition {
  /**
   * 操作符
   */
  operator: 'gt' | 'lt' | 'bgt' | 'blt' | 'equal';
  /**
   * 值
   */
  value: number;
}

/**
 * 自定义条件格式判断的样式
 * 数组最多有两个数值，第一个是添加的样式名，第二个 Icon 样式
 */
export type INumberFormatCustomConditionStyle = [
  INumberFormatConditionClassName,
  string,
];

/**
 * 自定义条件格式
 */
export interface INumberFormatCustomCondition {
  /**
   * 类型
   */
  type: 'condition';
  /**
   * 个性化条件判断
   */
  value: Array<{
    condition: INumberFormatCustomConditionCondition[];
    style: INumberFormatCustomConditionStyle;
  }>;
}

/**
 * 空条件格式
 */
export interface INumberFormatEmptyCondition {
  type: 'IDLE';
}

// 数值格式化的配置
export interface INumberFormatConfig {
  /**
   * 数值格式
   */
  format?: string;
  /**
   * 指定数值为业务数据还是财务数据
   */
  numberStyle?: 'BIZ' | 'FINANCE';
  /**
   * 单位, 数字需要整体除掉单位展示
   */
  unit?: 1 | 1000 | 1000000;
  /**
   * 条件格式
   */
  condition?:
    | INumberFormatCommonCondition
    | INumberFormatCustomCondition
    | INumberFormatEmptyCondition;
}
