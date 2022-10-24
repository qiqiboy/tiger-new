import { isValidElement, useState } from 'react';
import Button from 'components/Button';
import Modal from 'components/Modal';
import './style.scss';

export interface DialogProps {
    title?: React.ReactChild;
    content: React.ReactChild;
    type?: 'alert' | 'confirm';
    onOk?(event: React.MouseEvent<typeof Button>): any;
    onCancel?(event: React.MouseEvent<typeof Button>): any;
    btnOk?: string;
    btnCancel?: string;
}

export interface DialogState {
    okLoading: boolean;
    cancelLoading: boolean;
}

const alert = createDialog('alert');
const confirm = createDialog('confirm');

/**
 * @description
 * 基于Modal组件，提供了Dialog.alert 和 Dialog.confirm 两个对话框方法
 *
 * onOk和onCancel作为参数传递时，如果返回值是promise，则会在promise被resolve后才关闭对话框
 */
const Dialog: React.FC<DialogProps> & {
    alert: typeof alert;
    confirm: typeof confirm;
    open: typeof Modal.open;
} = ({ btnOk = '确定', btnCancel = '取消', title, content, type, onOk, onCancel }) => {
    const [okLoading, setOkLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const onBtnClick = (prop, ev) => {
        const callback = prop === 'onOk' ? onOk : onCancel;

        if (typeof callback === 'function') {
            const result = callback(ev);
            const setLoading = prop === 'onOk' ? setOkLoading : setCancelLoading;

            if (result && typeof result.then === 'function') {
                setLoading(true);

                const stop = () => setLoading(false);

                result.then(stop, stop);
            }
        }
    };

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
                        type="light"
                        round
                        loading={cancelLoading}
                        disabled={okLoading || cancelLoading}
                        onClick={onBtnClick.bind(this, 'onCancel')}>
                        {btnCancel}
                    </Button>
                )}
                <Button
                    round
                    type="primary"
                    loading={okLoading}
                    disabled={okLoading || cancelLoading}
                    onClick={onBtnClick.bind(this, 'onOk')}>
                    {btnOk}
                </Button>
            </Modal.Footer>
        </div>
    );
};

Dialog.alert = alert;
Dialog.confirm = confirm;
Dialog.open = Modal.open;

function createDialog(type) {
    function DialogFunction(config: DialogProps): Promise<any>;
    function DialogFunction(config: React.ReactChild, title?: React.ReactChild): Promise<any>;
    function DialogFunction(config, title?) {
        if (isValidElement(config) || typeof config !== 'object') {
            config = {
                content: config,
                title
            };
        }

        config.type = type;

        const { onOk, onCancel } = config as DialogProps;

        return Modal.open({
            backdrop: 'static',
            size: 'sm',
            className: 'modal-dialog-root',
            component: ({ close, dismiss }) => (
                <Dialog
                    {...(config as DialogProps)}
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
    }

    return DialogFunction;
}

export default Dialog;
