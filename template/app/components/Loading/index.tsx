import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import classlist from 'utils/classlist';
import './style.scss';

export interface ILoadingProps {
    label?: React.ReactNode; // 加载中的文字
    className?: string;
}

class Loading extends Component<ILoadingProps> {
    public render() {
        return (
            <div className={classlist('loading-root', this.props.className)}>
                <ProgressBar active now={100} label={this.props.label} />
            </div>
        );
    }
}

export default Loading;
