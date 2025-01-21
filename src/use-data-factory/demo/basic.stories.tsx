import * as React from 'react';
import { DataFactory } from '@/data-factory';
import { MatrixTable } from '@/core';

export default { title: 'DataFactory 数据工厂' };

const formatRows = [
  {
    id: 32364,
    name: '技术中台-服务器运营',
    level: 1,
    dataRowIndex: 1,
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: 1,
    numberStyle: 'FINANCE',
    format: '(0,0)',
    valueType: 'rowAndColumnCalculation',
    condition: null,
  },
  {
    id: 32367,
    name: '阿里巴巴-服务器费用-产品',
    level: 1,
    dataRowIndex: 2,
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: 'FINANCE',
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32365,
    name: '阿里巴巴-服务器费用-CTO',
    level: 1,
    dataRowIndex: 3,
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: 1,
    numberStyle: 'FINANCE',
    format: '(0,0)',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32366,
    name: '阿里巴巴-其他运营-CTO',
    level: 1,
    dataRowIndex: 4,
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32368,
    name: '阿里巴巴-其他运营-产品',
    level: 1,
    dataRowIndex: 5,
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
];

const formatColumns = [
  {
    id: 32395,
    name: 'Apr 预算',
    level: 1,
    dataColIndex: 'A',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32396,
    name: 'May 预算',
    level: 1,
    dataColIndex: 'B',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32397,
    name: 'Jun 预算',
    level: 1,
    dataColIndex: 'C',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32398,
    name: 'Jul 预算',
    level: 1,
    dataColIndex: 'D',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32399,
    name: 'Aug 预算',
    level: 1,
    dataColIndex: 'E',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32400,
    name: 'Sep 预算',
    level: 1,
    dataColIndex: 'F',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32401,
    name: 'Oct 预算',
    level: 1,
    dataColIndex: 'G',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32402,
    name: 'Nov 预算',
    level: 1,
    dataColIndex: 'H',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32403,
    name: 'Dec 预算',
    level: 1,
    dataColIndex: 'I',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32404,
    name: 'Jan 预算',
    level: 1,
    dataColIndex: 'J',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32405,
    name: 'Feb 预算',
    level: 1,
    dataColIndex: 'K',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32406,
    name: 'Mar 预算',
    level: 1,
    dataColIndex: 'L',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
];

export const 基础使用 = () => {
  const [displayValue, setDisplayValue] = React.useState('');
  const df = new DataFactory({
    rowHeaders: formatRows,
    colHeaders: formatColumns,
    cornerName: '这里是角头',
  });

  const cellRender = (rowIndex, colIndex, item) => {
    const completeData = JSON.stringify(item);
    return (
      <div
        title={completeData}
        onClick={() => setDisplayValue(JSON.stringify(item, null, 2))}
      >
        {completeData}
      </div>
    );
  };

  return (
    <div>
      <MatrixTable
        data={df.getFlattenExpandMatrix()}
        height={300}
        cellRender={cellRender}
        cornerAreaConfig={{
          className: 'corner-cell',
        }}
        dataAreaConfig={{
          className: 'data-cell data-cell-area',
        }}
        colHeaderConfig={{
          length: 1,
          cellRender,
        }}
        rowHeaderConfig={{
          length: 1,
          cellRender,
        }}
      />
      <pre dangerouslySetInnerHTML={{ __html: displayValue }} />
    </div>
  );
};
