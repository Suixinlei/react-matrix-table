import React, { useState, useEffect, useCallback } from 'react';
import { Card, Radio } from 'antd';
import { MatrixTable } from '../index';

import './demo.scss';

export default { title: 'demo/MatrixTable' };

const rowSize = 1000;
const colSize = 100;
const dataEmpty = Array(colSize)
  .fill(0)
  .map((o2, colIndex) => {
    // corner topleft
    if (!colIndex) {
      return { value: '单位', rowIndex: 0, colIndex };
    }
    // col header
    return { value: `时间-${colIndex}`, rowIndex: 0, colIndex };
  });
const dataMerge = Array(rowSize)
  .fill(0)
  .map((o1, rowIndex) =>
    Array(colSize)
      .fill(0)
      .map((o2, colIndex) => {
        // merge cells
        if (
          rowIndex >= 10 &&
          rowIndex <= 11 &&
          colIndex >= 2 &&
          colIndex <= 4
        ) {
          return {
            id: 'merged-cell',
            value: '合并单元格',
            rowSpan: 2,
            colSpan: 3,
            rowIndex: 10,
            colIndex: 2,
            className: 'merged-cell',
          };
        }
        if (rowIndex >= 4 && rowIndex <= 6 && colIndex === 4) {
          return {
            id: 'merged-cell-2',
            value: '合并单元格',
            rowSpan: 3,
            rowIndex: 10,
            colIndex,
            className: 'merged-cell',
          };
        }

        // corner topleft
        if (!rowIndex && !colIndex) {
          return { value: '单位', rowIndex, colIndex };
        }
        // col header
        if (!rowIndex) {
          return { value: `时间-${colIndex}`, rowIndex, colIndex };
        }
        // row header
        if (!colIndex) {
          return { value: `指标-${rowIndex}`, rowIndex, colIndex };
        }
        // data area
        return { value: `${rowIndex}-${colIndex}` };
      }),
  );

export const CustomAreaRender = () => {
  const [data, setData] = useState([]);
  const [emptyType, setEmptyType] = useState('empty');

  const getData = async () => {
    let res;
    if (emptyType === 'empty') {
      res = [dataEmpty];
    } else {
      res = dataMerge;
    }
    setData(res);
  };

  useEffect(() => {
    getData();
  }, [emptyType]);

  const areaRender = useCallback(() => {
    if (emptyType === 'empty') {
      return <div className="custom-empty">暂无数据</div>;
    }
    if (emptyType === 'no-permission') {
      return <div className="custom-no-permission">抱歉，您暂无权限访问此页面</div>;
    }
    return <div>自定义区域</div>;
  }, [emptyType]);

  const shouldScroll = useCallback(() => false, []);

  return (
    <div className='demo'>
      <Card title="自定义区域">
        <Radio.Group
          buttonStyle="solid"
          value={emptyType}
          onChange={(e) => setEmptyType(e.target.value)}
        >
          <Radio.Button value="empty">无数据</Radio.Button>
          <Radio.Button value="no-permission">无权限</Radio.Button>
        </Radio.Group>
        <MatrixTable
          data={data}
          height={500}
          cornerAreaConfig={{
            className: 'corner-cell',
          }}
          dataAreaConfig={{
            className: 'data-cell',
            areaRender,
            shouldScroll,
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
