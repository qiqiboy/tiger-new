import React from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';

type TransitionProps = Partial<CSSTransition.CSSTransitionProps>;

export default function withTransition(defaultProps, bindTime = false) {
    return class Transition extends React.Component<TransitionProps> {
        static defaultProps = {
            timeout: 1000,
            unmountOnExit: true,
            addEndListener: (node, done) => {
                node.addEventListener('transitionend', ev => ev.target === node && done(), false);
            },
            ...defaultProps
        };

        render() {
            const { children, classNames, ...props } = this.props;

            return (
                <CSSTransition
                    timeout={100}
                    classNames={bindTime ? `${classNames}-${props.timeout}` : classNames!}
                    {...props}>
                    {children}
                </CSSTransition>
            );
        }
    };
}
