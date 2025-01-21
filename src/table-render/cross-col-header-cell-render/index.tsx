import * as React from 'react';
import cx from 'classnames';
import { IoIosArrowDown } from 'react-icons/io';

import './index.scss';

export const crossColHeaderCellRender = (
  rowIndex: number,
  colIndex: number,
  item,
  onExpandCol,
) => {
  const { name, payload, children, dataColIndex, isExpand, numberStyle } = item;
  const { dataType = '' } = payload || {};

  let displayName: string = name || '';

  // console.log(name, payload, item);
  if (displayName.includes('$数值类型')) {
    if (dataType) {
      displayName = displayName.replace('$数值类型', `(${dataType})`);
    } else {
      displayName = displayName.replace('$数值类型', '');
    }
  }

  if (displayName.includes('^')) {
    displayName = displayName.replaceAll('^', '<br />');
    displayName = displayName.replaceAll('）', ')');
    displayName = displayName.replaceAll('（', '(');
  }

  const hasChildren = Array.isArray(children) && children.length > 0;

  return (
    <div
      className={cx({
        'react-matrix-table-cross-col-header': true,
        'has-children': hasChildren,
      })}
      onClick={() => {
        onExpandCol(dataColIndex);
      }}
    >
      <div
        className={cx({
          'col-header-title': true,
          'biz-style': numberStyle === 'BIZ',
        })}
        dangerouslySetInnerHTML={{
          __html: displayName,
        }}
      />
      {children && (
        <div className='col-header-icon'>
          <div
            className='expand-icon'
            title={isExpand ? '收起' : '展开'}
            style={{
              transform: isExpand ? 'rotate(360deg)' : 'rotate(270deg)',
              transition: 'transform 0.3s ease-in-out',
            }}
          >
            <IoIosArrowDown size={12} />
          </div>
        </div>
      )}
    </div>
  );
};
