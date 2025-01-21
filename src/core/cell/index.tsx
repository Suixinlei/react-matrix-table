import React from 'react';
import cx from 'classnames';
import MatrixContext from '../MatrixTable/context';
import { RowHeaderConfig } from '../types';
import { CellProps, CellState } from './types';

import { PREFIX, TREE_LEVEL_INDENT } from '../constants';

export default class Cell extends React.Component<CellProps, CellState> {
  static context: React.ContextType<typeof MatrixContext>;

  static contextType = MatrixContext;

  static displayName = 'Cell';

  // shouldComponentUpdate(nextProps: CellProps) {
  //   // const simpleKeys: Array<keyof CellProps> = [
  //   //   'id',
  //   //   'type',
  //   //   'value',
  //   //   'level',
  //   //   'isExpand',
  //   //   'onExpandRow',
  //   //   'width',
  //   //   'height',
  //   //   'rowSpan',
  //   //   'colSpan',
  //   //   'rowIndex',
  //   //   'colIndex',
  //   //   'renderRowIndex',
  //   //   'renderColIndex',
  //   //   'className',
  //   // ];
  //   // const deepKeys: Array<keyof CellProps> = ['style', 'config'];
  //   // const compareKeys = [].concat(simpleKeys, deepKeys);
  //   // const curProps = this.props;

  //   // const isShouldUpdate = compareKeys.some(key => {
  //   //   const cur = curProps[key];
  //   //   const next = nextProps[key];
  //   //   return deepKeys.includes(key) ? !isEqual(cur, next) : cur !== next;
  //   // });
  //   const isShouldUpdate = (this.props.id !== nextProps.id);

  //   return isShouldUpdate;
  // }

  renderContent() {
    const { config, rowIndex, colIndex, value: itemValue, level } = this.props;
    const { data, cellRender } = this.context;
    const customRender = config?.cellRender || cellRender;

    let value: React.ReactNode;
    if (typeof customRender === 'function') {
      value = customRender(rowIndex, colIndex, this.props);
    }
    if (value === undefined) {
      // cellRender可以只针对部分单元格定制渲染
      // 返回undefined或未返回值，则走默认渲染逻辑
      value = itemValue;
    }
    if ((config as RowHeaderConfig)?.layoutType === 'tree') {
      const baseLevel = (config as RowHeaderConfig)?.baseLevel ?? 1;
      const cellLevel = level ?? baseLevel;
      const hasChild = data[rowIndex + 1]?.[0]?.level > cellLevel;
      const style: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        paddingLeft: (cellLevel - baseLevel) * TREE_LEVEL_INDENT + (hasChild ? 0 : 20),
      };
      const isPlain = typeof value === 'string' || typeof value === 'number';
      value = (
        <div style={style}>
          {isPlain ? <span className={`${PREFIX}-tree-label`}>{value}</span> : value}
        </div>
      );
    }
    return value;
  }

  render() {
    const { style, className: itemCls, config, rowIndex, colIndex } = this.props;
    const { cellExtraProps } = this.context;
    const className = cx(config?.className, itemCls);

    return (
      <div
        className={cx(`${PREFIX}-cell`, className)}
        style={style}
        data-rowindex={rowIndex}
        data-colindex={colIndex}
        {...cellExtraProps}
      >
        {this.renderContent()}
      </div>
    );
  }
}
