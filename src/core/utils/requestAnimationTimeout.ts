import { animation } from 'dom-lib';

const { requestAnimationFramePolyfill, cancelAnimationFramePolyfill } = animation;

export const cancelAnimationTimeout = (id: number) => cancelAnimationFramePolyfill(id);

/**
 * Recursively calls requestAnimationFrame until a specified delay has been met or exceeded.
 * When the delay time has been reached the function you're timing out will be called.
 *
 * Credit: Joe Lambert (https://gist.github.com/joelambert/1002116#file-requesttimeout-js)
 */
export const requestAnimationTimeout = (callback: () => void, delay: number): number => {
  let start: number;
  // wait for end of processing current event handler, because event handler may be long
  Promise.resolve().then(() => {
    start = Date.now();
  });

  let id = null;

  const timeout = () => {
    if (Date.now() - start >= delay) {
      callback.call(null);
    } else {
      id = requestAnimationFramePolyfill(timeout);
    }
  };

  id = requestAnimationFramePolyfill(timeout);

  return id;
};
