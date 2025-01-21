import React from 'react';
import { MatrixProps, MatrixState } from './types';

type PassDownProps =
  | 'data'
  | 'cellRender'
  | 'cellExtraProps'
  | 'dynamicalLock'
  | 'dynamicFixedConfig';
type PassDownState = 'expandRowIndexMap' | 'customWidthMap' | 'customHeightMap' | 'initFixedConfig';

export interface MatrixContextProps
  extends Pick<MatrixProps, PassDownProps>,
    Pick<MatrixState, PassDownState> {
  expandRow: (rowIndex: number, expand: boolean, node: Record<string, any>) => void;
}

const MatrixContext = React.createContext<MatrixContextProps>({
  data: [],
  expandRowIndexMap: {},
  customWidthMap: {},
  customHeightMap: {},
  initFixedConfig: {},
  dynamicalLock: false,
  dynamicFixedConfig: {
    fixedColIndexs: [],
  },
  expandRow: () => {},
});

export default MatrixContext;
