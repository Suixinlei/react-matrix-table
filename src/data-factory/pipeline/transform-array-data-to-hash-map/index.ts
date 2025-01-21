import omit from 'lodash/omit';

/**
 * 将数据转换为哈希表格式
 * @param arrayData
 * @returns
 */
export function transformArrayDataToHashMap(arrayData) {
  const hashMap = {};
  arrayData.forEach((arrayDataItem) => {
    if (arrayDataItem.columnIndex && arrayDataItem.rowIndex) {
      hashMap[`${arrayDataItem.columnIndex}:${arrayDataItem.rowIndex}`] =
        omit(['rowIndex', 'columnIndex'], arrayDataItem);
    }
  });

  return hashMap;
}
