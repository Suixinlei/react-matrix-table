export * from './area-helper';
export * from './matrix-helper';

/**
 * Returns an object consisting of props beyond the scope of the Component.
 * Useful for getting and spreading unknown props from the user.
 * @param {function} Component A function or ReactClass.
 * @param {object} props A ReactElement props object
 * @returns {{}} A shallow copy of the prop object
 */
export const getUnhandledProps = (Component: any, props: any): string[] => {
  const { handledProps = [], propTypes = {} } = Component;
  const propTypeKeys = Object.keys(propTypes);

  return Object.keys(props).reduce((acc: any, prop: string) => {
    if (prop === 'childKey') {
      return acc;
    }
    if (handledProps.length > 0 && handledProps.indexOf(prop) === -1) {
      acc[prop] = props[prop];
    }
    if (propTypeKeys.length > 0 && propTypeKeys.indexOf(prop) === -1) {
      acc[prop] = props[prop];
    }

    return acc;
  }, {});
};

export const getEventHandlers = (props: any): Record<string, any> => {
  const handlers: Record<string, any> = {};
  Object.keys(props)
    .filter((key) => key.startsWith('on'))
    .forEach((key) => {
      const hdl = props[key];
      if (typeof hdl === 'function') {
        handlers[key] = hdl;
      }
    });
  return handlers;
};
