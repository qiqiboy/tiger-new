import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';
import Button from 'components/Button';

export interface ErrorBoxProps {
    error: Error | string;
    onClick?: React.MouseEventHandler;
    title: string;
}
export interface ErrorBoxState {
    loading: boolean;
}

class ErrorBox extends Component<ErrorBoxProps, ErrorBoxState> {
    static defaultProps = {
        title: '发生了错误'
    };

    readonly state = {} as ErrorBoxState;

    onBtnClick = async ev => {
        const { onClick } = this.props;

        try {
            this.setState({
                loading: true
            });

            // eslint-disable-next-line
            await onClick!(ev);
        } catch (error) {
            //
        }

        if (!this.isUnmount) {
            this.setState({
                loading: false
            });
        }
    };

    isUnmount: boolean;
    public componentWillUnmount() {
        this.isUnmount = true;
    }

    public render() {
        const { error, title, onClick } = this.props;
        const msg = error instanceof Error ? error.message : error;

        return (
            <Alert variant="danger" className="errorbox-root">
                {title && <Alert.Heading>{title}</Alert.Heading>}
                {typeof msg === 'object' ? msg : <p>{msg}</p>}
                {onClick && (
                    <Button
                        onClick={this.onBtnClick}
                        type="danger"
                        size="sm"
                        loading={this.state.loading}
                        disabled={this.state.loading}>
                        重试
                    </Button>
                )}
            </Alert>
        );
    }
}

export default ErrorBox;
