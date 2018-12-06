import React, { Component, Fragment } from 'react';
import { ProgressBar, Glyphicon } from 'react-bootstrap';
import classlist from 'utils/classlist';
import './style.scss';

export interface ILoadingProps {
    label?: React.ReactNode; // 加载中的文字
    className?: string;
    type?: 'bar' | 'circle';
}

class Loading extends Component<ILoadingProps> {
    static defaultProps = {
        type: 'bar'
    };

    public render() {
        return (
            <div className={classlist('loading-root', `loading-type-${this.props.type}`, this.props.className)}>
                {this.props.type === 'bar' ? (
                    <ProgressBar active now={100} label={this.props.label} />
                ) : (
                    <Fragment>
                        <div className="loading-inner">
                            <Glyphicon glyph="refresh" />
                        </div>
                        {this.props.label}
                    </Fragment>
                )}
            </div>
        );
    }
}

export default Loading;
