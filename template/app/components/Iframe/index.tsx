import React, { Component, Fragment } from 'react';
// import Icon from 'components/Icon';
import Portal from 'components/Portal';
import { Flow, Fade } from 'components/Transition';
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
                <Flow in={this.props.in}>
                    <Portal>
                        <div className="iframe-container">
                            <div className="scroll-wrapper">
                                <iframe title="tiger brokers" className="iframe" src={src} frameBorder="0" />
                            </div>
                            <div className="close" onClick={onClose}>
                                {/*<Icon name="clear" />*/}
                            </div>
                        </div>
                    </Portal>
                </Flow>
                <Fade in={this.props.in}>
                    <div className="iframe-backdrop" />
                </Fade>
            </Fragment>
        );
    }
}

export default Iframe;
