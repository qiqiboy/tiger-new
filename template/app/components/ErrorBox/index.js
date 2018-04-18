import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import './style.scss';

class ErrorBox extends Component {
    render() {
        const message = typeof this.props.error === 'string' ? this.props.error : this.props.error.message;
        return (
            <div className="error-box">
                <div className="texts">
                    {message}{' '}
                    {this.props.onClick && (
                        <Button type="warning" block onClick={this.props.onClick}>
                            重试
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    static propTypes = {
        //是否全局
        error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired
    };
}

export default ErrorBox;
