import React, { Component } from 'react';
import Transition, { TransitionProps } from 'react-transition-group/Transition';

export interface ICollapseProps extends Partial<TransitionProps> {
    direction?: 'v' | 'h';
}

const TransitionClassName = 'transition-collapse-active-';
const events = ['onEnter', 'onEntering', 'onEntered', 'onExit', 'onExiting', 'onExited'];
const verticalCssNames = [
    'marginTop',
    'marginBottom',
    'paddingTop',
    'paddingBottom',
    'borderTopWidth',
    'borderBottomWidth'
];

const horizontalCssNames = [
    'marginLeft',
    'marginRight',
    'paddingLeft',
    'paddingRight',
    'borderLeftWidth',
    'borderRightWidth'
];

function triggerReflow(node) {
    // tslint:disable-next-line
    node.offsetHeight;
}

class Collapse extends Component<ICollapseProps> {
    static defaultProps = {
        direction: 'v',
        timeout: 600,
        unmountOnExit: true,
        addEndListener(node, done) {
            node.addEventListener('transitionend', ev => ev.target === node && done(), false);
        }
    };

    transitionEvents = events.reduce((props, name) => {
        props[name] = (...args) => {
            this[name](...args);
            if (this.props[name]) {
                this.props[name](...args);
            }
        };
        return props;
    }, {});

    getCssNames() {
        return this.props.direction === 'v'
            ? {
                  sizeName: 'height',
                  sizeFrom: 'offsetHeight',
                  boxProps: verticalCssNames
              }
            : {
                  sizeName: 'width',
                  sizeFrom: 'offsetWidth',
                  boxProps: horizontalCssNames
              };
    }

    defaultStyle: any;
    inlineStyle: any;

    snapStyle = node => {
        const cssNames = this.getCssNames();

        if (!this.defaultStyle) {
            const style = getComputedStyle(node, null);

            this.defaultStyle = cssNames.boxProps.reduce(
                (defaultStyle, name) => {
                    defaultStyle[name] = style[name];

                    return defaultStyle;
                },
                {
                    [cssNames.sizeName]: node[cssNames.sizeFrom] + 'px'
                }
            );
        }

        if (!this.inlineStyle) {
            this.inlineStyle = cssNames.boxProps.reduce(
                (inlineStyle, name) => {
                    inlineStyle[name] = node.style[name];

                    return inlineStyle;
                },
                {
                    [cssNames.sizeName]: node.style[cssNames.sizeName]
                }
            );
        }
    };

    revertStyle = node => {
        const cssNames = this.getCssNames();

        node.style[cssNames.sizeName] = this.inlineStyle[cssNames.sizeName];
        cssNames.boxProps.forEach(name => (node.style[name] = this.inlineStyle[name]));

        delete this.inlineStyle;
        delete this.defaultStyle;
    };

    onEnter = node => {
        const cssNames = this.getCssNames();

        this.snapStyle(node);

        // 将相关值设为0
        node.style[cssNames.sizeName] = 0;
        cssNames.boxProps.forEach(name => (node.style[name] = 0));
    };
    onEntering = node => {
        triggerReflow(node);

        const cssNames = this.getCssNames();

        node.classList.add(TransitionClassName + this.props.timeout);

        // 保持其默认值
        cssNames.boxProps.forEach(name => (node.style[name] = this.defaultStyle[name]));
        node.style[cssNames.sizeName] = this.defaultStyle[cssNames.sizeName];
    };
    onEntered = node => {
        node.classList.remove(TransitionClassName + this.props.timeout);

        // 恢复默认的内联样式
        this.revertStyle(node);
    };
    onExit = node => {
        const cssNames = this.getCssNames();

        this.snapStyle(node);

        node.style[cssNames.sizeName] = node[cssNames.sizeFrom] + 'px';
    };
    onExiting = node => {
        triggerReflow(node);

        const cssNames = this.getCssNames();

        node.classList.add(TransitionClassName + this.props.timeout);

        node.style[cssNames.sizeName] = 0;
        cssNames.boxProps.forEach(name => (node.style[name] = 0));
    };
    onExited = node => {
        node.classList.remove(TransitionClassName + this.props.timeout);

        this.revertStyle(node);
    };

    public render() {
        const { direction, ...props } = this.props;

        return <Transition timeout={100} {...props} {...this.transitionEvents} />;
    }
}

export default Collapse;
