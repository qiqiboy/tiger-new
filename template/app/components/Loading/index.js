import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Portal from 'components/Portal';
import './style.scss';

class Loading extends Component {
    _render() {
        return (
            <div className="loading-container">
                <div className="circle" />
                {typeof this.props.children === 'string' ? (
                    <div className="loading-text">{this.props.children}</div>
                ) : (
                    this.props.children
                )}
            </div>
        );
    }

    render() {
        const dom = this._render();
        return this.props.global ? <Portal className="global-loading">{dom}</Portal> : dom;
    }

    static defaultProps = {
        global: false
    };

    static propTypes = {
        //是否全局
        global: PropTypes.bool.isRequired
    };
}

export default Loading;
