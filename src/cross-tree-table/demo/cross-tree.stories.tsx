import { CrossTreeTable } from '@/cross-tree-table';
import { useDataFactory } from '@/use-data-factory';

export default { title: 'demo/CrossTreeTable' };

const formatRows = [
  {
    id: 31274,
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
    id: 31275,
    name: '阿里巴巴-服务器费用-CTO',
    level: 2,
    dataRowIndex: 2,
    defaultExpand: true,
    defaultDisplay: true,
    parent: 1,
    unit: 1,
    numberStyle: 'FINANCE',
    format: '(0,0)',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 31276,
    name: '阿里巴巴-其他运营-CTO',
    level: 2,
    dataRowIndex: 3,
    defaultExpand: true,
    defaultDisplay: true,
    parent: 1,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 31277,
    name: '阿里巴巴-服务器费用-产品',
    level: 2,
    dataRowIndex: 4,
    defaultExpand: true,
    defaultDisplay: true,
    parent: 1,
    unit: null,
    numberStyle: 'FINANCE',
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 31278,
    name: '阿里巴巴-其他运营-产品',
    level: 2,
    dataRowIndex: 5,
    defaultExpand: true,
    defaultDisplay: true,
    parent: 1,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 32044,
    name: '新维度7628',
    level: 1,
    dataRowIndex: 6,
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'setNull',
    condition: null,
  },
];

const formatColumns = [
  {
    id: 31397,
    name: '本版预测',
    level: 1,
    dataColIndex: 'A',
    defaultExpand: false,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'rowAndColumnCalculation',
    condition: null,
  },
  {
    id: 31322,
    name: '本版预测-1',
    level: 2,
    dataColIndex: 'AA',
    defaultExpand: true,
    defaultDisplay: true,
    parent: 'A',
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 31629,
    name: '年度预算',
    level: 1,
    dataColIndex: 'AB',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'rowAndColumnCalculation',
    condition: null,
  },
  {
    id: 31329,
    name: '年度预算-1',
    level: 2,
    dataColIndex: 'AC',
    defaultExpand: true,
    defaultDisplay: true,
    parent: 'AB',
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 31330,
    name: '年度预算-2',
    level: 2,
    dataColIndex: 'AD',
    defaultExpand: true,
    defaultDisplay: true,
    parent: 'AB',
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
  {
    id: 31449,
    name: '上版本预测',
    level: 1,
    dataColIndex: 'O',
    defaultExpand: true,
    defaultDisplay: true,
    parent: null,
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'rowAndColumnCalculation',
    condition: null,
  },
  {
    id: 31310,
    name: '上版本预测-1',
    level: 2,
    dataColIndex: 'P',
    defaultExpand: true,
    defaultDisplay: true,
    parent: 'O',
    unit: null,
    numberStyle: null,
    format: '',
    valueType: 'indicator',
    condition: null,
  },
];

export const 左树上展开展示 = () => {
  const { tableProps } = useDataFactory({
    mode: 'crossTree',
    rowHeaders: formatRows,
    colHeaders: formatColumns,
    cornerName: '这里是一段测试的话，用于预测前台看板验证',
  });

  return (
    <CrossTreeTable {...tableProps} tableHeight={500} cellCache={false} />
  );
};
