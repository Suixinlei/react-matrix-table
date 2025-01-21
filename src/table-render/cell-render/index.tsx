import cx from 'classnames';
import numvert from 'numvert';

import './index.scss';

export const cellRender = (
  rowIndex: number,
  colIndex: number,
  item,
  externalProps: any,
) => {
  const { payload = {}, numberFormat = {} } = item;
  const { matrixData } = externalProps;

  const { format } = numberFormat;

  const { level: rowLevel } = matrixData?.[rowIndex]?.[0] || {};

  // TODO: 样式设定优先级
  const classes = {
    data: true,
    [`row-level-${rowLevel}`]: !!rowLevel,
  };

  if (format === 'setNull') {
    return (
      <div className={cx(classes)}>
        <span />
        <span />
      </div>
    );
  }

  if (payload.itemNumber) {
    return (
      <div className={cx(classes)}>
        <span className='number'>
          {numvert(payload.itemNumber).format(format)}
        </span>
      </div>
    );
  }

  return (
    <div className={cx(classes)}>
      <span />
      <span>-</span>
    </div>
  );
};
