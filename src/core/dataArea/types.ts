/*
 * @Description: 数据区域类型定义
 * @Autor: yongqing.dyq@alibaba-inc.com
 * @Date: 2021-10-20 13:37:59
 * @LastEditors: yongqing.dyq@alibaba-inc.com
 * @LastEditTime: 2021-10-20 13:40:50
 */

import {
  AreaProps,
  AreaState,
  DataAreaConfig,
} from '../types';

export interface DataAreaProps extends AreaProps {
  areaConfig: DataAreaConfig;
}
export interface DataAreaState extends AreaState {

}
