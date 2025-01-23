import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import { MatrixTable } from '../index';

import './demo.scss';

export default { title: 'demo/MatrixTable' };

const rowSize = 100;
const colSize = 100;
const dataLength = Array(rowSize)
  .fill(0)
  .map((o1, rowIndex) =>
    Array(colSize)
      .fill(0)
      .map((o2, colIndex) => {
        // corner topleft
        if (!rowIndex && !colIndex) {
          return { value: '单位', rowIndex, colIndex };
        }
        // col header
        if (!rowIndex) {
          const customWidthIndexes = [1, 2, 5, 8, 13, 21, 34, 55, 89];
          let width;
          if (customWidthIndexes.includes(colIndex)) {
            width = 80;
          }
          return { value: `时间-${colIndex}`, rowIndex, colIndex, width };
        }
        // row header
        if (!colIndex) {
          const customHeightIndexes = [3, 6, 9, 15, 24, 39, 63];
          let height;
          if (customHeightIndexes.includes(rowIndex)) {
            height = 80;
          }
          return { value: `指标-${rowIndex}`, rowIndex, colIndex, height };
        }
        // data area
        return { value: `${rowIndex}-${colIndex}` };
      }),
  );

export const 自定义单元格宽高 = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(dataLength);
  }, []);

  return (
    <div className='demo'>
      <h1>自定义行列宽高</h1>
      <Card>
        <MatrixTable
          data={data}
          height={500}
          cornerAreaConfig={{
            className: 'corner-cell',
          }}
          dataAreaConfig={{
            className: 'data-cell',
          }}
          colHeaderConfig={{
            length: 1,
            className: 'fixed-row-cell',
          }}
          rowHeaderConfig={{
            length: 1,
            className: 'fixed-col-cell',
          }}
        />
      </Card>
    </div>
  );
};
