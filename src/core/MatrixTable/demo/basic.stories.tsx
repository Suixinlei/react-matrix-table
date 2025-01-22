import * as React from 'react';
import { MatrixTable } from '@/core';

import './demo.scss';

export default { title: 'demo/MatrixTable' };

export const BasicUsage = () => {
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
            if (idxInner === 8) {
              Object.assign(cell, { width: 100 });
            }
            if (idxOuter === 6) {
              Object.assign(cell, { height: 50 });
            }
            // merge cell
            if (
              idxOuter >= 10 &&
              idxOuter <= 111 &&
              idxInner >= 20 &&
              idxInner <= 22
            ) {
              return {
                ...cell,
                id: 'merged-cell',
                value: '合并单元格',
                rowSpan: 102,
                colSpan: 3,
                rowIndex: 10,
                colIndex: 20,
                className: 'merged-cell',
              };
            }
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

  const [data, setData] = React.useState([]);
  const [tableHeight, setTableHeight] = React.useState(500);

  React.useEffect(() => {
    console.time('genData');
    const data = genData();
    console.timeEnd('genData');
    setData(data);
  }, []);

  const onRandomHeight = () => {
    const randomHeight = Math.random() * 1000;
    console.log('randomHeight', randomHeight);
    setTableHeight(randomHeight);
  };

  return (
    <div className="demo">
      <button onClick={onRandomHeight}>改变高度</button>
      <MatrixTable
        data={data}
        height={tableHeight}
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
        cacheCell={true}
      />
    </div>
  );
};
