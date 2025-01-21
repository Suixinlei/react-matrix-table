import * as React from 'react';
import cx from 'classnames';
import { IoIosArrowForward } from 'react-icons/io';

import './index.scss';

export const flattenColHeaderCellRender = (
  rowIndex: number,
  colIndex: number,
  item,
  onExpandCol,
) => {
  const {
    name,
    payload,
    level,
    children,
    dataColIndex,
    isExpand,
    numberStyle,
  } = item;
  const { dataType = '' } = payload || {};

  let displayName: string = name || '';

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
        'react-matrix-table-flatten-col-header-cell': true,
        'has-children': hasChildren,
        [`level-${level}`]: !!level,
        'has-expand': isExpand,
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
          {isExpand ? (
            <div className='expand-icon'>
              <IoIosArrowForward size={12} />
            </div>
          ) : (
            <div className='sanjiaoxing-jiaobiao' />
          )}
        </div>
      )}
    </div>
  );
};
