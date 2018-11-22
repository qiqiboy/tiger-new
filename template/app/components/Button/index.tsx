import React, { Component } from 'react';
import { Button, ButtonProps, ProgressBar } from 'react-bootstrap';
import classlist from 'utils/classlist';
import './style.scss';

export interface IHButtonProps extends ButtonProps {
    loading?: boolean;
}

/**
 * @description
 * 相比于默认的Button，增加了loading状态
 */
class HButton extends Component<IHButtonProps> {
    public render() {
        const { children, loading, ...props } = this.props;
        return (
            <Button
                {...props}
                className={classlist(props.className, {
                    'btn-loading': loading
                })}>
                {loading ? <span className="loading-text">{children}</span> : children}
                {loading && (
                    <ProgressBar active now={100} bsStyle={props.bsStyle === 'primary' ? undefined : props.bsStyle!} />
                )}
            </Button>
        );
    }
}

export default HButton;
