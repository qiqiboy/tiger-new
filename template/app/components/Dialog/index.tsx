import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import Modal from 'components/Modal';
import Button from 'components/Button';
import './style.scss';

export interface IDialogProps {
    title?: React.ReactNode;
    content: React.ReactNode;
    type?: 'alert' | 'confirm';
    onOk?(): void;
    onCancel?(): void;
}

/**
 * @description
 * 基于Modal组件，提供了Dialog.alert 和 Dialog.confirm 两个对话框方法
 */
class Dialog extends Component<IDialogProps> {
    public render() {
        const { title, content, type } = this.props;

        return (
            <div className="dialog-root">
                {title && (
                    <Modal.Header>
                        {typeof title === 'string' ? (
                            <Modal.Title className="dialog-default-header">
                                <Glyphicon glyph="bell" /> {title}
                            </Modal.Title>
                        ) : (
                            title
                        )}
                    </Modal.Header>
                )}
                {content && <Modal.Body>{content}</Modal.Body>}
                <Modal.Footer>
                    {type === 'confirm' && (
                        <Button bsStyle="default" onClick={this.props.onCancel}>
                            取消
                        </Button>
                    )}
                    <Button bsStyle="primary" onClick={this.props.onOk}>
                        确定
                    </Button>
                </Modal.Footer>
            </div>
        );
    }

    static alert = (config: IDialogProps | string) => {
        if (typeof config === 'string') {
            config = {
                content: config
            };
        }

        return Modal.open({
            backdrop: 'static',
            bsSize: 'sm',
            className: 'modal-dialog-root',
            onHide(props) {
                props.close();
            },
            component: ({ close }) => <Dialog {...config as IDialogProps} type="alert" onOk={close} />
        }).result;
    };

    static 'confirm' = (config: IDialogProps | string) => {
        if (typeof config === 'string') {
            config = {
                content: config
            };
        }

        return Modal.open({
            backdrop: 'static',
            bsSize: 'sm',
            className: 'modal-dialog-root',
            component: ({ close, dismiss }) => (
                <Dialog {...config as IDialogProps} type="confirm" onOk={close} onCancel={dismiss} />
            )
        }).result;
    };

    static open = Modal.open;
}

export default Dialog;
