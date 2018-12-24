import React from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';

type TransitionProps = Partial<CSSTransition.CSSTransitionProps>;

const events = ['onEntering', 'onEntered', 'onExiting', 'onExited'];

export default function withTransition(defaultProps) {
    return class Transition extends React.Component<TransitionProps> {
        static defaultProps = {
            timeout: 1000,
            unmountOnExit: true,
            addEndListener: (node, done) => {
                node.addEventListener('transitionend', ev => ev.target === node && done(), false);
            },
            classNames: 'transition-fade',
            ...defaultProps
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

        onEntering = node => {
            if (node) {
                node.style.transitionDuration = node.style.WebkitTransitionDuration = node.style.MozTransitionDuration =
                    this.props.timeout + 'ms';
            }
        };

        onEntered = node => {
            if (node) {
                node.style.transitionDuration = node.style.WebkitTransitionDuration = node.style.MozTransitionDuration =
                    '';
            }
        };

        onExiting = this.onEntering;
        onExited = this.onEntered;

        render() {
            const { children, timeout, classNames, ...props } = this.props;

            return (
                <CSSTransition timeout={timeout!} classNames={classNames!} {...props} {...this.transitionEvents}>
                    {children}
                </CSSTransition>
            );
        }
    };
}
