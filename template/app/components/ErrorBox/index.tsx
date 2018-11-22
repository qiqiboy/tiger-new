import React, { Component } from 'react';
import MessageBox from '../MessageBox';
import Button from 'components/Button';
import './style.scss';

export interface IErrorBoxProps {
    error: Error | string;
    onClick?: (ev: React.MouseEvent<Button>) => void;
    title: string;
}
export interface IErrorBoxState {
    loading: boolean;
}

class ErrorBox extends Component<IErrorBoxProps, IErrorBoxState> {
    static defaultProps = {
        title: '发生了错误'
    };

    readonly state = {} as IErrorBoxState;

    onBtnClick = async ev => {
        const { onClick } = this.props;

        try {
            this.setState({
                loading: true
            });

            await onClick!(ev);
        } catch (error) {
            //
        }

        this.setState({
            loading: false
        });
    };

    public render() {
        const { error, title, onClick } = this.props;
        const msg = error instanceof Error ? error.message : error;

        return (
            <MessageBox
                className="error-box-root"
                message={
                    <div className="error-box-body">
                        <h4 className="error-title">{title}</h4>
                        {typeof msg === 'object' ? msg : <p>{msg}</p>}
                        {onClick && (
                            <p>
                                <Button
                                    onClick={this.onBtnClick}
                                    bsStyle="danger"
                                    bsSize="small"
                                    loading={this.state.loading}
                                    disabled={this.state.loading}>
                                    重试
                                </Button>
                            </p>
                        )}
                    </div>
                }
                type="danger"
            />
        );
    }
}

export default ErrorBox;
