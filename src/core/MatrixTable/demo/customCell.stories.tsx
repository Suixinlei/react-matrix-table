import React, { useState, useEffect, useCallback } from 'react';
import { Card, DatePicker, Tag, Space } from 'antd';
import dayjs from 'dayjs';
import { MatrixTable } from '../index';

import './demo.scss';

export default { title: 'demo/MatrixTable' };

const rowSize = 1000;
const colSize = 100;
const genData = () => {
  return Array(rowSize)
    .fill(0)
    .map((o1, idxOuter) =>
      Array(colSize)
        .fill(0)
        .map((o2, idxInner) => {
          const cell = {
            rowIndex: idxOuter,
            colIndex: idxInner,
          };

          // corner 0-0
          if (!idxOuter && !idxInner) {
            return { ...cell, value: '单位' };
          }
          // corner (m - 1)-0
          if (idxOuter === rowSize - 1 && !idxInner) {
            return { ...cell, value: '合计' };
          }
          // corner 0-(m - 1)
          if (idxInner === colSize - 1 && !idxOuter) {
            return { ...cell, value: '操作' };
          }
          // corner (m - 1)-(m - 1)
          if (idxOuter === rowSize - 1 && idxInner === colSize - 1) {
            return cell;
          }
          // col footer (m - 1)-n
          if (idxOuter === rowSize - 1 && idxInner) {
            return { ...cell, value: `合计-${idxInner}` };
          }
          // custom width
          if (idxInner === 3) {
            Object.assign(cell, { width: 240 });
          }
          // col header 0-n
          if (!idxOuter) {
            return { ...cell, value: `时间-${idxInner}` };
          }
          // row footer
          if (idxInner === colSize - 1) {
            return { ...cell, value: `操作-${idxOuter}` };
          }
          // row header n-0
          if (!idxInner) {
            let level = 1;
            switch (idxOuter) {
              case 2:
              case 4:
                level = 2;
                break;
              case 3:
                level = 3;
                break;
              default:
                level = 1;
                break;
            }
            return { ...cell, value: `指标-${idxOuter}`, level };
          }

          // data area
          return { ...cell, value: `${idxOuter}-${idxInner}` };
        }),
    );
};

export const 自定义单元格 = () => {
  const [data, setData] = useState([]);
  const dataCellRender = useCallback(
    (rowIndex, colIndex) => {
      const value = data[rowIndex][colIndex]?.value;
      if (rowIndex === 2 && colIndex === 3) {
        return (
          <div className='data-cell-inner'>
            <DatePicker
              defaultValue={dayjs()}
              onChange={(val) => console.log(val)}
            />
          </div>
        );
      }
      if (rowIndex === 3 && colIndex == 3) {
        const presetColors = ['blue', 'green', 'orange', 'red'];
        return (
          <Space>
            {presetColors.map((color) => (
              <Tag
                key={`p_n_${color}`}
                color={color}
              >
                {color}
              </Tag>
            ))}
          </Space>
        );
      }
    },
    [data],
  );

  useEffect(() => {
    console.time('genData');
    const data = genData();
    console.timeEnd('genData');
    setData(data);
  }, []);

  return (
    <div className='demo'>
      <Card title='单元格定制的使用'>
        <MatrixTable
          data={data}
          height={500}
          cellRender={dataCellRender}
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
          colFooterConfig={{
            length: 1,
            className: 'fixed-row-cell',
          }}
          rowHeaderConfig={{
            length: 1,
            className: 'fixed-col-cell',
            layoutType: 'tree',
          }}
          rowFooterConfig={{
            length: 1,
            className: 'fixed-col-cell',
          }}
        />
      </Card>
    </div>
  );
};
