import React, { Component } from 'react';
import { Transition } from 'react-transition-group';
import { TransitionProps } from './withTransition';

export interface CollapseProps extends TransitionProps {
    direction?: 'v' | 'h';
}

const TransitionClassName = 'transition-collapse-active';
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
    // eslint-disable-next-line
    node.offsetHeight;
}

class Collapse extends Component<CollapseProps> {
    static defaultProps = {
        direction: 'v',
        timeout: 600,
        unmountOnExit: true,
        addEndListener: (node, done) => {
            const onTransitionEnd = ev => {
                node.removeEventListener('transitionend', onTransitionEnd, false);

                if (ev.target === node) {
                    done();
                }
            };

            node.addEventListener('transitionend', onTransitionEnd, false);
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
                    [cssNames.sizeName]: `${node[cssNames.sizeFrom]}px`
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
        if (this.inlineStyle) {
            const cssNames = this.getCssNames();

            node.style[cssNames.sizeName] = this.inlineStyle[cssNames.sizeName];
            cssNames.boxProps.forEach(name => (node.style[name] = this.inlineStyle[name]));

            delete this.inlineStyle;
            delete this.defaultStyle;
        }
    };

    addTransition = node => {
        node.classList.add(TransitionClassName);

        node.style.transitionDuration = node.style.WebkitTransitionDuration = node.style.MozTransitionDuration = `${
            this.props.timeout
        }ms`;
    };

    onEnter = node => {
        if (node) {
            const cssNames = this.getCssNames();

            this.snapStyle(node);

            // 将相关值设为0
            node.style[cssNames.sizeName] = 0;
            cssNames.boxProps.forEach(name => (node.style[name] = 0));
        }
    };

    onEntering = node => {
        if (node) {
            triggerReflow(node);

            this.addTransition(node);

            const cssNames = this.getCssNames();

            cssNames.boxProps.forEach(name => (node.style[name] = this.defaultStyle[name]));
            node.style[cssNames.sizeName] = this.defaultStyle[cssNames.sizeName];
        }
    };

    onEntered = node => {
        if (node) {
            node.classList.remove(TransitionClassName);
            node.style.transitionDuration = node.style.WebkitTransitionDuration = node.style.MozTransitionDuration = '';

            // 恢复默认的内联样式
            this.revertStyle(node);
        }
    };

    onExit = node => {
        if (node) {
            const cssNames = this.getCssNames();

            this.snapStyle(node);

            node.style[cssNames.sizeName] = `${node[cssNames.sizeFrom]}px`;
        }
    };

    onExiting = node => {
        if (node) {
            triggerReflow(node);

            this.addTransition(node);

            const cssNames = this.getCssNames();

            node.style[cssNames.sizeName] = 0;
            cssNames.boxProps.forEach(name => (node.style[name] = 0));
        }
    };

    onExited = this.onEntered;

    public render() {
        const { timeout, ...props } = this.props;

        return <Transition timeout={timeout!} {...props} {...this.transitionEvents} />;
    }
}

export default Collapse;
