import { CheckCircleOutline, ErrorOutlineOutlined, WarningAmberOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
    AlertColor,
    Box,
    ButtonProps,
    Dialog,
    DialogActions,
    DialogContent,
    DialogProps,
    DialogTitle,
    Grow,
    Modal
} from '@mui/material';
import { cloneElement, createElement, ReactElement, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createRoot as _createRoot } from 'react-dom/client';

export let createRoot = _createRoot;

/**
 * 用于同步组件树上下文，只需要将该组件放在应用组件树中渲染即可
 */
export const ModalRoot: React.FC = () => {
    const [modals, setModals] = useState<Record<string, ReactElement>>({});
    const rootRef = useRef<HTMLDivElement>();

    if (!rootRef.current) {
        rootRef.current = document.createElement('div')!;
        document.body.appendChild(rootRef.current);
    }

    useEffect(() => {
        createRoot = () => {
            const id = `mui-modal${Date.now() + Math.random()}`;

            return {
                render(element: ReactElement) {
                    setModals(modals => ({
                        ...modals,
                        [id]: cloneElement(element, {
                            key: id
                        })
                    }));
                },
                unmount() {
                    setModals(modals => {
                        delete modals[id];

                        return { ...modals };
                    });
                }
            };
        };

        return () => {
            if (rootRef.current) {
                document.body.appendChild(rootRef.current);
            }

            createRoot = _createRoot;
        };
    }, []);

    return createPortal(Object.values(modals), rootRef.current);
};

/**
 * 扩展Modal组件，使其类似于antd中的Modal组件，以支持以下快速调用：
 *
 * Modal.success - 创建成功提示框
 * Modal.error
 * Modal.info
 * Modal.warn
 *
 * Modal.confirm - 创建具有ok和cancel两个按钮的确认框
 *
 * Modal.open - 快速创建Modal弹窗，该方法是对Modal的一个命令式封装
 *
 * 所有的方法均返回promise，可以通过promise获取用户关闭窗口的回调
 */

export interface DialogSettings
    extends Omit<DialogProps, 'open' | 'title' | 'children' | 'onClose' | 'keepMounted' | 'content'> {
    title?: React.ReactNode; // 如果传入字符串，自动使用DialogTitle包装
    content?: React.ReactNode; // 如果传入字符串，自动使用DialogContent包装
    okButtonProps?: ButtonProps;
    cancelButtonProps?: ButtonProps;
    okText?: string;
    cancelText?: string;
    onOK?(): any;
    onCancel?(): any;
}

export type ExtendModalObject = typeof Modal & {
    success(settings: DialogSettings): Promise<any>;
    error(settings: DialogSettings): Promise<any>;
    info(settings: DialogSettings): Promise<any>;
    warning(settings: DialogSettings): Promise<any>;
    confirm(settings: DialogSettings): Promise<any>;
    open(settings: ModalSettings): Promise<any>;
};

type Scenes = AlertColor | 'confirm';

const IconPresets: Record<Scenes, ReactElement> = {
    success: <CheckCircleOutline color="success" />,
    error: <ErrorOutlineOutlined color="error" />,
    info: <ErrorOutlineOutlined color="info" />,
    warning: <WarningAmberOutlined color="warning" />,
    confirm: <ErrorOutlineOutlined color="primary" />
};

const _Modal = Modal as ExtendModalObject;

_Modal.success = createDialog('success');
_Modal.error = createDialog('error');
_Modal.info = createDialog('info');
_Modal.warning = createDialog('warning');
_Modal.confirm = createDialog('confirm');
_Modal.open = openModal;

export { _Modal as Modal };

const ExtendDialog: React.FC<
    DialogSettings & {
        type: Scenes;
    }
> = ({
    title,
    content,
    okText,
    cancelText,
    okButtonProps,
    cancelButtonProps,
    onOK,
    onCancel,
    type,
    ...dialogProps
}) => {
    const [visible, setVisible] = useState(true);
    const [loading, setLoading] = useState<false | 'ok' | 'cancel'>(false);
    const hideDialog = () => setVisible(false);
    const isConfirm = type === 'confirm';

    const handleOKButton = async () => {
        setLoading('ok');

        try {
            await onOK?.();

            hideDialog();
        } finally {
            setLoading(false);
        }
    };

    const handleCancelButton = async () => {
        setLoading('cancel');

        try {
            await onCancel?.();

            hideDialog();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog {...dialogProps} open={visible}>
            <Box display="flex" p={3}>
                {cloneElement(IconPresets[type], {
                    fontSize: 'large',
                    sx: {
                        mt: 2
                    }
                })}
                <Box>
                    {title && (typeof title === 'string' ? <DialogTitle>{title}</DialogTitle> : title)}
                    {content && (typeof content === 'string' ? <DialogContent>{content}</DialogContent> : content)}
                    <DialogActions>
                        {isConfirm && (
                            <LoadingButton
                                variant="outlined"
                                size="medium"
                                {...cancelButtonProps}
                                onClick={handleCancelButton}
                                loading={loading === 'cancel'}
                                disabled={!!loading}>
                                {cancelText}
                            </LoadingButton>
                        )}
                        <LoadingButton
                            variant="contained"
                            size="medium"
                            {...okButtonProps}
                            onClick={handleOKButton}
                            loading={loading === 'ok'}
                            disabled={!!loading}>
                            {okText}
                        </LoadingButton>
                    </DialogActions>
                </Box>
            </Box>
        </Dialog>
    );
};

ExtendDialog.defaultProps = {
    okText: 'OK',
    cancelText: 'Cancel',
    TransitionComponent: Grow
};

function createDialog(type: Scenes) {
    return async (settings: DialogSettings) => {
        let clearContainer;
        const result = new Promise((resolve, reject) => {
            const container = document.createElement('div');
            const root = createRoot(container);

            document.body.appendChild(container);

            clearContainer = () => {
                setTimeout(() => {
                    root.unmount();
                    document.body.removeChild(container);
                }, 500);
            };

            const updateDialog = () => {
                root.render(
                    <ExtendDialog
                        {...settings}
                        type={type}
                        onOK={async () => {
                            let data;

                            data = await settings.onOK?.();
                            resolve(data);
                        }}
                        onCancel={async () => {
                            let reason;

                            reason = await settings.onCancel?.();
                            reject(reason);
                        }}
                    />
                );
            };

            updateDialog();
        });

        result.finally(clearContainer).catch(() => {});

        return result;
    };
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                        Modal                                                        //
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface ModalSettings extends Omit<DialogProps, 'open' | 'children' | 'onClose' | 'keepMounted'> {
    component: React.ComponentType<ModalHandler>;
    maskClosable?: boolean; // 禁用backdrop和ESC关闭
}

export interface ModalHandler {
    close(data?: any): void;
    dismiss(reason?: any): void;
}

const ExtendModal: React.FC<
    ModalSettings & {
        modalHandler: ModalHandler;
    }
> = ({ component, maskClosable, modalHandler, ...props }) => {
    const [visible, setVisible] = useState(true);
    const hideModal = () => setVisible(false);

    return (
        <Dialog
            {...props}
            open={visible}
            onClose={(event, reason) => {
                if (maskClosable || (reason !== 'backdropClick' && reason !== 'escapeKeyDown')) {
                    modalHandler.dismiss(reason);
                    hideModal();
                }
            }}>
            {createElement(component, {
                close(data) {
                    modalHandler.close(data);
                    hideModal();
                },
                dismiss(reason) {
                    modalHandler.dismiss(reason);
                    hideModal();
                }
            })}
        </Dialog>
    );
};

async function openModal(settings: ModalSettings) {
    let clearContainer;

    const result = new Promise((resolve, reject) => {
        const container = document.createElement('div');
        const root = createRoot(container);

        document.body.appendChild(container);

        clearContainer = () => {
            setTimeout(() => {
                root.unmount();
                document.body.removeChild(container);
            }, 500);
        };

        const updateDialog = () => {
            root.render(
                <ExtendModal
                    {...settings}
                    modalHandler={{
                        close: resolve,
                        dismiss: reject
                    }}
                />
            );
        };

        updateDialog();
    });

    result.finally(clearContainer).catch(() => {});

    return result;
}
