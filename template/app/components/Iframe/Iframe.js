import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';
import Portal from 'components/Portal';
import { Flow, Fade } from 'components/Transition';
import './style.scss';

class Iframe extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired, //关闭按钮点击的回调
        src: PropTypes.string.isRequired //页面地址
    };

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
                                <Icon name="clear" />
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
