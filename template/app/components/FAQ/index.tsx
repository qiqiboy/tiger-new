import React, { Component, Fragment } from 'react';
import { findDOMNode } from 'react-dom';
import { Overlay, Glyphicon } from 'react-bootstrap';
import './style.scss';

export type IFAQProps = Overlay.OverlayProps;

export interface IFAQState {
    visible: boolean;
}

class OverlayContainer extends Component<
    {
        className?: string;
        style?: any;
        target: React.ReactInstance;
        hide(): void;
    },
    {
        top: number;
        left: number;
        right: number;
        arrowLeft: number;
    }
> {
    readonly state = {
        top: -1e10,
        left: -1e10,
        right: -1e10,
        arrowLeft: 50
    };

    targetNode: Element = findDOMNode(this.props.target) as Element;

    public componentDidMount() {
        this.resize();

        window.addEventListener('scroll', this.resize, false);
    }

    public componentWillUnmount() {
        window.removeEventListener('scroll', this.resize, false);
    }

    resize = () => {
        const targetRect = this.targetNode.getBoundingClientRect();
        const parentRect = (this.targetNode.parentNode as Element).getBoundingClientRect();

        this.setState({
            top: targetRect.top + targetRect.height + 10,
            left: parentRect.left,
            right: window.innerWidth - parentRect.right,
            arrowLeft: targetRect.left - parentRect.left
        });
    };

    public render() {
        const { children, className } = this.props;
        return (
            <div
                className={className + ' faq-overlay-root'}
                style={{ top: this.state.top + 'px', left: this.state.left + 'px', right: this.state.right + 'px' }}>
                {children}
                <Glyphicon glyph="triangle-top" className="arrow" style={{ marginLeft: this.state.arrowLeft + 'px' }} />
                <Glyphicon glyph="remove" className="close" onClick={this.props.hide} />
            </div>
        );
    }
}

class FAQ extends Component<IFAQProps, IFAQState> {
    readonly state = {} as IFAQState;

    toggle = () => {
        this.setState(preState => ({
            visible: !preState.visible
        }));
    };

    public render() {
        const { children, ...props } = this.props;
        return (
            <Fragment>
                <Glyphicon glyph="question-sign" className="faq-root" onClick={this.toggle} />
                <Overlay rootClose={true} {...props} show={this.state.visible} placement="left" onHide={this.toggle}>
                    <OverlayContainer target={this} hide={this.toggle}>
                        {children}
                    </OverlayContainer>
                </Overlay>
            </Fragment>
        );
    }
}

export default FAQ;
