import React from 'react';
import classNames from 'classnames';
import {
  DOMMouseMoveTracker,
  translateDOMPositionXY,
  addStyle,
  getOffset,
} from 'dom-lib';
import { PREFIX, SCROLLBAR_MIN_WIDTH } from '../constants';
import { getUnhandledProps } from '../utils';
import {
  ScrollbarProps,
  ScrollbarState,
} from './types';
export default class Scrollbar extends React.PureComponent<ScrollbarProps, ScrollbarState> {
  static displayName = 'Scrollbar';
  static defaultProps = {
    scrollLength: 1,
    length: 1,
  };

  scrollOffset = 0;
  mouseMoveTracker = null;
  handleRef: React.RefObject<HTMLDivElement>;
  barRef: React.RefObject<HTMLDivElement>;

  constructor(props: ScrollbarProps) {
    super(props);
    this.state = {
      barOffset: {
        top: 0,
        left: 0,
      },
      handlePressed: false,
    };
    this.handleRef = React.createRef();
    this.barRef = React.createRef();
  }

  componentDidMount() {
    this.initBarOffset();
  }

  componentWillUnmount() {
    this.releaseMouseMoves();
  }

  onWheelScroll(delta: number) {
    const { length, scrollLength } = this.props;
    if (this.mouseMoveTracker && this.mouseMoveTracker.isDragging()) {
      const nextDelta = delta / scrollLength;
      this.updateScrollBarPosition(nextDelta);
    } else {
      const nextDelta = delta / (scrollLength / length);
      this.updateScrollBarPosition(nextDelta);
    }
  }

  getMouseMoveTracker() {
    return (
      this.mouseMoveTracker ||
      new DOMMouseMoveTracker(
        this.handleDragMove,
        this.handleDragEnd,
        document.body
      )
    );
  }

  initBarOffset() {
    setTimeout(() => {
      this.barRef.current &&
        this.setState({
          barOffset: getOffset(this.barRef.current),
        });
    }, 1);
  }

  handleMouseDown = (event: React.MouseEvent) => {
    /* eslint-disable no-unused-expressions */
    this.mouseMoveTracker = this.getMouseMoveTracker();
    this.mouseMoveTracker?.captureMouseMoves(event);
    this.setState({ handlePressed: true });
    this.props.onMouseDown?.(event);
    /* eslint-enable no-unused-expressions */
  };

  handleDragEnd = () => {
    this.releaseMouseMoves();
    this.setState({ handlePressed: false });
  };

  handleScroll(delta: number, event: React.MouseEvent) {
    const { length, scrollLength } = this.props;
    const scrollDelta = delta * (scrollLength / length);

    this.updateScrollBarPosition(delta);
    /* eslint-disable no-unused-expressions */
    this.props.onScroll?.(scrollDelta, event);
    /* eslint-enable no-unused-expressions */
  }

  resetScrollBarPosition(forceDelta = 0) {
    this.scrollOffset = 0;
    this.updateScrollBarPosition(0, forceDelta);
  }

  updateScrollBarPosition(delta: number, forceDelta?: number) {
    const { vertical, length, scrollLength } = this.props;
    const max =
      scrollLength && length
        ? length -
          Math.max((length / scrollLength) * length, SCROLLBAR_MIN_WIDTH + 2)
        : 0;
    const styles: any = {};
    if (typeof forceDelta === 'undefined') {
      this.scrollOffset += delta;
      this.scrollOffset = Math.max(this.scrollOffset, 0);
      this.scrollOffset = Math.min(this.scrollOffset, max);
    } else {
      this.scrollOffset = forceDelta * (length / scrollLength);
    }

    if (vertical) {
      translateDOMPositionXY(styles, 0, this.scrollOffset);
    } else {
      translateDOMPositionXY(styles, this.scrollOffset, 0);
    }

    addStyle(this.handleRef.current, styles);
  }

  releaseMouseMoves() {
    /* eslint-disable no-unused-expressions */
    this.mouseMoveTracker?.releaseMouseMoves?.();
    this.mouseMoveTracker = null;
    /* eslint-enable no-unused-expressions */
  }

  handleDragMove = (
    deltaX: number,
    deltaY: number,
    event: React.MouseEvent
  ) => {
    const { vertical } = this.props;

    if (!this.mouseMoveTracker || !this.mouseMoveTracker.isDragging()) {
      return;
    }

    if (event?.buttons === 0 || window?.event?.['buttons'] === 0) {
      this.releaseMouseMoves();
      return;
    }

    this.handleScroll(vertical ? deltaY : deltaX, event);
  };

  /**
   * 点击滚动条，然后滚动到指定位置
   */
  handleClick = (event: React.MouseEvent) => {
    if (
      this.handleRef.current &&
      this.handleRef.current?.contains(event.target as Node)
    ) {
      return;
    }

    const { vertical, length, scrollLength } = this.props;
    const { offsetX, offsetY } = event.nativeEvent;
    const offset = vertical ? offsetY : offsetX;

    const handleWidth = (length / scrollLength) * length;
    const delta = offset - handleWidth;
    const nextDelta =
      offset > this.scrollOffset
        ? delta - this.scrollOffset
        : offset - this.scrollOffset;
    this.handleScroll(nextDelta, event);
  };

  render() {
    const { vertical, length, scrollLength, tableId, ...rest } = this.props;
    const { handlePressed } = this.state;
    const scrollCls = `${PREFIX}-scrollbar`;
    const classes = classNames(scrollCls, {
      [`${scrollCls}-vertical`]: vertical,
      [`${scrollCls}-horizontal`]: !vertical,
      [`${scrollCls}-hidden`]: scrollLength <= length,
      [`${scrollCls}-pressed`]: handlePressed,
    });
    const width = (length / scrollLength) * 100;
    const styles: React.CSSProperties = {
      [vertical ? 'height' : 'width']: `${width}%`,
      [vertical ? 'minHeight' : 'minWidth']: SCROLLBAR_MIN_WIDTH,
    };
    const unhandled = getUnhandledProps(Scrollbar, rest);
    const valuenow = (this.scrollOffset / length) * 100 + width;
    return (
      <div
        role="scrollbar"
        aria-controls={tableId}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={valuenow}
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        {...unhandled}
        ref={this.barRef}
        className={classes}
        onClick={this.handleClick}
      >
        <div
          ref={this.handleRef}
          className={`${scrollCls}-handle`}
          style={styles}
          onMouseDown={this.handleMouseDown}
          role="button"
          tabIndex={-1}
        />
      </div>
    );
  }
}
