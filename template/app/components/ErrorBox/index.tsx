import React, { Component } from 'react';
import Button from '../Button';
import './style.scss';

interface IErrorBoxProps {
    error: React.ReactNode | Error;
    onClick?: (ev?: React.SyntheticEvent) => void;
}

class ErrorBox extends Component<IErrorBoxProps> {
    render() {
        const { error } = this.props;
        const message = error instanceof Error ? error.message : error;

        return (
            <div className="error-box">
                <div className="texts">
                    {message}{' '}
                    {this.props.onClick && (
                        <Button type="warning" block size="sm" onClick={this.props.onClick}>
                            重试
                        </Button>
                    )}
                </div>
            </div>
        );
    }
}

export default ErrorBox;
