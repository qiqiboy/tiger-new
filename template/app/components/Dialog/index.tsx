import React, { Component, isValidElement } from 'react';
import Modal from 'components/Modal';
import Button from 'components/Button';
import './style.scss';

export interface IDialogProps {
    title?: React.ReactNode;
    content: React.ReactNode;
    type?: 'alert' | 'confirm';
    onOk?(ev: any): any;
    onCancel?(ev: any): any;
    btnOk?: string;
    btnCancel?: string;
}

export interface IDialogState {
    loading: boolean;
}

/**
 * @description
 * 基于Modal组件，提供了Dialog.alert 和 Dialog.confirm 两个对话框方法
 *
 * onOk和onCancel作为参数传递时，如果返回值是promise，则会在promise被resolve后才关闭对话框
 */
class Dialog extends Component<IDialogProps, IDialogState> {
    static defaultProps = {
        btnOk: '确定',
        btnCancel: '取消'
    };

    readonly state = {
        loading: false
    };

    onBtnClick = (prop, ev) => {
        const callback = this.props[prop];

        if (typeof callback === 'function') {
            const result = callback(ev);

            if (result && typeof result.then === 'function') {
                this.setState({
                    loading: true
                });

                const stop = () =>
                    this.setState({
                        loading: false
                    });

                result.then(stop, stop);
            }
        }
    };

    public render() {
        const { title, content, btnOk, btnCancel, type } = this.props;
        const { loading } = this.state;

        return (
            <div className="dialog-root">
                {title && (
                    <Modal.Header>
                        {typeof title === 'string' ? (
                            <Modal.Title className="dialog-default-header">{title}</Modal.Title>
                        ) : (
                            title
                        )}
                    </Modal.Header>
                )}
                {content && <Modal.Body>{content}</Modal.Body>}
                <Modal.Footer>
                    {type === 'confirm' && (
                        <Button
                            type="default"
                            round
                            ghost
                            loading={loading}
                            disabled={loading}
                            onClick={this.onBtnClick.bind(this, 'onCancel')}>
                            {btnCancel}
                        </Button>
                    )}
                    <Button
                        round
                        type="primary"
                        loading={loading}
                        disabled={loading}
                        onClick={this.onBtnClick.bind(this, 'onOk')}>
                        {btnOk}
                    </Button>
                </Modal.Footer>
            </div>
        );
    }

    static alert = createDialog('alert');
    static confirm = createDialog('confirm');

    static open = Modal.open;
}

function createDialog(type) {
    return (config: IDialogProps | string | React.ReactElement<any>, title?: React.ReactNode) => {
        if (typeof config === 'string' || isValidElement(config)) {
            config = {
                content: config,
                title
            };
        }

        config.type = type;

        const { onOk, onCancel } = config as IDialogProps;

        return Modal.open({
            backdrop: 'static',
            bsSize: 'sm',
            className: 'modal-dialog-root',
            component: ({ close, dismiss }) => (
                <Dialog
                    {...config as IDialogProps}
                    onOk={ev => {
                        let result;

                        if (typeof onOk === 'function') {
                            result = onOk(ev);

                            if (result && typeof result.then === 'function') {
                                return result.then(close);
                            }
                        }

                        close(result);
                    }}
                    onCancel={ev => {
                        let result;

                        if (typeof onCancel === 'function') {
                            result = onCancel(ev);

                            if (result && typeof result.then === 'function') {
                                return result.then(dismiss);
                            }
                        }

                        dismiss(result);
                    }}
                />
            )
        }).result;
    };
}

export default Dialog;
