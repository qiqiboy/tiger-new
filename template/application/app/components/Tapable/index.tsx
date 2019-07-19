import React, { Component, cloneElement } from 'react';

export interface TapableProps<T = Element> extends React.DOMAttributes<T> {
    onTap?: React.ReactEventHandler<T>; // 单击
    onLongTap?: React.ReactEventHandler<T>; // 长按
    onPress?: React.ReactEventHandler<T>; // 按住不放，连续触发
    children: React.ReactElement;
}

/**
 * @description
 * 提供点按、长按事件，兼容鼠标
 */
class Tapable extends Component<TapableProps> {
    static defaultProps = {
        component: 'span'
    };

    onMouseDown: React.MouseEventHandler;
    onMouseMove: React.MouseEventHandler;
    onMouseUp: React.MouseEventHandler;
    onMouseLeave: React.MouseEventHandler;
    onTouchStart: React.TouchEventHandler;
    onTouchEnd: React.TouchEventHandler;
    onTouchMove: React.TouchEventHandler;
    onTouchCancel: React.TouchEventHandler;
    onContextMenu: React.MouseEventHandler;

    startTime: number;
    startRect: number[];
    eventType: string;
    isValid: boolean;
    pressTimer: any;
    clearTimer: any;

    constructor(props) {
        super(props);

        const handlers = {
            onMouseDown: this.handleStart,
            onMouseMove: this.handleMove,
            onMouseUp: this.handleEnd,
            onMouseLeave: this.handleMove,
            onTouchStart: this.handleStart,
            onTouchMove: this.handleMove,
            onTouchEnd: this.handleEnd,
            onTouchCancel: this.handleEnd,
            // 移除右键事件行为，避免打端正常的操作
            onContextMenu(ev) {
                ev.preventDefault();
            }
        };

        // 保证这些事件，如果用户设置了，还是可以保证触发
        Object.keys(handlers).forEach(name => {
            this[name] = event => {
                if (props[name]) {
                    props[name](event);
                }

                return handlers[name](event);
            };
        });
    }

    formatEvent = ev => {
        const event = {} as any;

        event.target = ev.target;
        event.nativeType = ev.type;
        event.eventType = /mouse/i.test(ev.type) ? 'mouse' : 'touch';

        [event.clientX, event.clientY] = ev.changedTouches
            ? [ev.changedTouches[0].clientX, ev.changedTouches[0].clientY]
            : [ev.clientX, ev.clientY];

        return event;
    };

    triggerPress = ev => {
        if (this.props.onPress) {
            ev.type = 'press';

            const runPress = () => {
                this.props.onPress!(ev);

                this.forceUpdate();

                this.pressTimer = setTimeout(runPress, 50);
            };

            runPress();
        }
    };

    handleStart = ev => {
        ev = this.formatEvent(ev);

        // 我们要确保事件类型一致，或者当前没有相连的事件
        if (!this.eventType || this.eventType === ev.eventType) {
            clearTimeout(this.clearTimer);

            this.eventType = ev.eventType;

            this.startTime = Date.now();
            this.startRect = [ev.clientX, ev.clientY];

            this.pressTimer = setTimeout(() => this.triggerPress(ev), 350);
        }
    };

    handleMove = ev => {
        ev = this.formatEvent(ev);

        // 确保是同一类型事件
        if (ev.eventType === this.eventType) {
            const newRect = [ev.clientX, ev.clientY];

            if (Math.abs(newRect[0] - this.startRect[0]) > 5 || Math.abs(newRect[1] - this.startRect[1]) > 5) {
                this.clearHandler();
            }
        }
    };

    handleEnd = ev => {
        ev = this.formatEvent(ev);

        if (ev.eventType === this.eventType) {
            if (!/cancel/i.test(ev.nativeType)) {
                const newRect = [ev.clientX, ev.clientY];
                const endTime = Date.now();
                const expire = endTime - this.startTime;
                const { onTap, onLongTap } = this.props;

                if (Math.abs(newRect[0] - this.startRect[0]) < 5 || Math.abs(newRect[1] - this.startRect[1]) < 5) {
                    if (expire < 300) {
                        if (onTap) {
                            ev.type = 'tap';
                            onTap(ev);
                        }
                    } else {
                        if (onLongTap) {
                            ev.type = 'longtap';
                            onLongTap(ev);
                        }
                    }
                }
            }

            this.clearHandler();
        }
    };

    clearHandler = () => {
        clearTimeout(this.pressTimer);

        // 我们要延迟清除最后一次事件触发事件类型标记
        // 因为mouse事件在touch事件后触发，如果立即清除标记，会导致紧接着再次以mouse事件触发一次，导致重复
        this.clearTimer = setTimeout(() => delete this.eventType, 400);
    };

    public componentWillUnmount() {
        this.clearHandler();
    }

    public render() {
        const { children, onTap, onLongTap, onPress, ...props } = this.props;

        return cloneElement(children, {
            ...props,
            onContextMenu: this.onContextMenu,
            onMouseDown: this.onMouseDown,
            onMouseUp: this.onMouseUp,
            onMouseMove: this.onMouseMove,
            onMouseLeave: this.onMouseLeave,
            onTouchStart: this.onTouchStart,
            onTouchEnd: this.onTouchEnd,
            onTouchMove: this.onTouchMove,
            onTouchCancel: this.onTouchCancel
        });
    }
}

export default Tapable;
