import React, { Component } from 'react';
import Portal from 'components/Portal';
import classlist from 'utils/classlist';
import './style.scss';

interface ILoadingProps {
    className?: string;
    global: boolean;
}

class Loading extends Component<ILoadingProps> {
    _render() {
        return (
            <div className={classlist('loading-container', this.props.className)}>
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
}

export default Loading;
