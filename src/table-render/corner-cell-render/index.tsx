import { Tooltip } from 'react-tooltip';

import './index.scss';

export const cornerCellRender = (rowIndex, colIndex, item, colHeaderHeight) => {
  const { payload } = item;
  const { name } = payload;

  return (
    <div className='react-matrix-table-corner-cell'>
      <span className='text' data-tooltip-id="corner-cell-tooltip" data-tooltip-content={name}>
        {name}
      </span>
      <Tooltip id="corner-cell-tooltip" />
    </div>
  );
};
