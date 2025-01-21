import React from 'react';
import MatrixContext from '../MatrixTable/context';
import { CustomLengthMap } from '../types';

export interface CompWithHeightMap {
  customWidthMap?: CustomLengthMap;
  customHeightMap?: CustomLengthMap;
}

type HOC<P extends CompWithHeightMap> = (
  component: React.ComponentType<P>,
) => React.ComponentClass<Omit<P, keyof CompWithHeightMap>>;

const WithWidthMap: HOC<any> = (Component) => {
  return class extends React.Component<any> {
    render() {
      return (
        <MatrixContext.Consumer>
          {({ customWidthMap, customHeightMap }) => (
            <Component
              {...this.props}
              customWidthMap={customWidthMap}
              customHeightMap={customHeightMap}
            />
          )}
        </MatrixContext.Consumer>
      );
    }
  };
};

export default WithWidthMap;
