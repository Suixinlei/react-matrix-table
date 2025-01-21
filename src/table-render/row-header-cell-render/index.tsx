import * as React from 'react';
import cx from 'classnames';
import { IoIosArrowDown } from 'react-icons/io';

import './index.scss';

export const rowHeaderCellRender = (
  rowIndex: number,
  colIndex: number,
  item,
  onExpandRow,
) => {
  const { name, dataRowIndex, children, level, isExpand, numberStyle } = item;

  const rowHeaderStyle = {
    paddingLeft: 32 + (level - 1) * 12,
    paddingRight: 8,
  };
  const rowHeaderIconStyle = {
    left: 16 + (level - 1) * 12,
    top: 3,
  };

  let displayName: string = name || '';

  if (displayName.includes('^')) {
    displayName = displayName.replaceAll('^', '&nbsp;');
    displayName = displayName.replaceAll('）', ')');
    displayName = displayName.replaceAll('（', '(');
  }

  return (
    <div
      className={cx({
        'react-matrix-table-row-header-cell': true,
        [`level-${level}`]: !!level,
      })}
      style={rowHeaderStyle}
      onClick={() => {
        onExpandRow(dataRowIndex);
      }}
    >
      <div className='row-header-icon' style={rowHeaderIconStyle}>
        {Array.isArray(children) && children.length > 0 && (
          <div
            className='expand-icon'
            title={isExpand ? '收起' : '展开'}
            style={{
              transform: isExpand ? 'rotate(360deg)' : 'rotate(270deg)',
              transition: 'transform 0.3s ease-in-out',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IoIosArrowDown size={12} />
          </div>
        )}
      </div>
      <div
        title={name}
        className={cx({
          'row-header-title': true,
          'biz-style': numberStyle === 'BIZ',
        })}
        dangerouslySetInnerHTML={{
          __html: displayName,
        }}
      />
    </div>
  );
};
