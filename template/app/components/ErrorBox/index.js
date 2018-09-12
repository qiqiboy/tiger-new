import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import './style.scss';

class ErrorBox extends Component {
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

    static propTypes = {
        //是否全局
        error: PropTypes.oneOfType([PropTypes.object, PropTypes.node]).isRequired,
        onClick: PropTypes.func
    };
}

export default ErrorBox;
