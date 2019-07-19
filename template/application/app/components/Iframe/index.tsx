import React, { Component, Fragment } from 'react';
import { Glyphicon } from 'react-bootstrap';
import Portal from 'components/Portal';
import { Flip, Fade } from 'components/Transition';
import './style.scss';

interface IIframeProps {
    onClose(ev: React.MouseEvent): void;
    src: string;
    in?: boolean;
}

class Iframe extends Component<IIframeProps> {
    render() {
        const { src, onClose } = this.props;

        return (
            <Fragment>
                <Flip in={this.props.in}>
                    <Portal>
                        <div className="iframe-container">
                            <div className="scroll-wrapper">
                                <iframe title="tiger brokers" className="iframe" src={src} frameBorder="0" />
                            </div>
                            <div className="close" onClick={onClose}>
                                <Glyphicon glyph="remove" />
                            </div>
                        </div>
                    </Portal>
                </Flip>
                <Fade in={this.props.in}>
                    <Portal>
                        <div className="iframe-backdrop" />
                    </Portal>
                </Fade>
            </Fragment>
        );
    }
}

export default Iframe;
