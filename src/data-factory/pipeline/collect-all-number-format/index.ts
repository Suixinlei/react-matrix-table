import { transformTreeToFlatten } from '@/data-factory/utils/transformTreeToFlatten';
import {
  INumberFormatConfig,
  IRowTreeItem,
  IColTreeItem,
} from '@/data-factory/types';

export const collectAllNumberFormat = (
  rowTree: IRowTreeItem[],
  colTree: IColTreeItem[],
) => {
  const flattenRowArr = transformTreeToFlatten(rowTree, true);
  const flattenColArr = transformTreeToFlatten(colTree, true);

  const numberFormatMap: Record<string, INumberFormatConfig> = {};

  // 单位优先级: 列 > 行 > 默认值
  for (let j = 0; j < flattenColArr.length; j++) {
    for (let i = 0; i < flattenRowArr.length; i++) {
      // 哈希索引是 列：行 的格式
      const hashIndex = `${flattenColArr[j].dataColIndex}:${flattenRowArr[i].dataRowIndex}`;
      // 如果该索引没有创建则先创建
      if (!numberFormatMap[hashIndex]) {
        numberFormatMap[hashIndex] = {};
      }

      // 数值格式
      const defaultFormat = '(0,0.00)';
      const currentFormat =
        flattenColArr[j].format || flattenRowArr[i].format || defaultFormat;
      // 数值格式特殊规则：行、列任何一个 valueType = 'setNull' 则显示为空字符串
      if (
        flattenColArr[j].valueType === 'setNull' ||
        flattenRowArr[i].valueType === 'setNull'
      ) {
        numberFormatMap[hashIndex].format = 'setNull';
      } else {
        numberFormatMap[hashIndex].format = currentFormat;
      }

      // 业财数据
      const defaultNumberStyle = 'FINANCE';
      const currentNumberStyle =
        flattenColArr[j].numberStyle ||
        flattenRowArr[i].numberStyle ||
        defaultNumberStyle;
      numberFormatMap[hashIndex].numberStyle = currentNumberStyle;

      // 条件格式
      const defaultCondition = { type: 'IDLE' };
      const currentCondition =
        flattenColArr[j].condition ||
        flattenRowArr[i].condition ||
        defaultCondition;
      numberFormatMap[hashIndex].condition = currentCondition;

      // 单位
      const defaultUnit = 1;
      const currentUnit =
        flattenColArr[j].unit || flattenRowArr[i].unit || defaultUnit;
      numberFormatMap[hashIndex].unit = currentUnit;
    }
  }

  return numberFormatMap;
};
