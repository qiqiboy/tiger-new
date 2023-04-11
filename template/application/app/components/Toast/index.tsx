import { CloseRounded as CloseIcon } from '@mui/icons-material';
import { Alert, AlertColor, Backdrop, CircularProgress, IconButton, Slide, Snackbar } from '@mui/material';
import React from 'react';
import { createRoot } from '../Modal';

/**
 * 类似于antd中的message，基本用法如下：
 *
 * toast.success('message', 30000, () => console.log('closed'));
 *
 * 当使用toast.loading时，需要手动控制关闭：
 * const destroy = toast.loading('loading...');
 * setTimeout(() => destroy(), 3000); // 3s后关闭
 */
export const toast = {
    message: createToast('message'),
    success: createToast('success'),
    error: createToast('error'),
    info: createToast('info'),
    warning: createToast('warning'),
    loading: createToast('loading') as (message: React.ReactNode) => () => void
};

interface ToastProps {
    visible: boolean;
    type: 'message' | AlertColor | 'loading';
    message: React.ReactNode;
    duration: number;
    onClose(): void;
}

const Toast: React.FC<ToastProps> = ({ visible, type, message, duration, onClose }) => {
    if (type === 'message') {
        return (
            <Snackbar
                open={visible}
                message={message}
                anchorOrigin={{
                    horizontal: 'center',
                    vertical: 'top'
                }}
                autoHideDuration={duration}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
                onClose={onClose}
                TransitionComponent={Slide}
                ClickAwayListenerProps={{ mouseEvent: false, touchEvent: false }}
            />
        );
    }

    if (type === 'loading') {
        return (
            <>
                <Snackbar
                    open={visible}
                    anchorOrigin={{
                        horizontal: 'center',
                        vertical: 'top'
                    }}
                    ContentProps={{
                        sx: {
                            minWidth: '0 !important',
                            flexGrow: 0,
                            flexWrap: 'nowrap'
                        }
                    }}
                    message={message}
                    action={<CircularProgress size={20} sx={{ mr: 1 }} />}
                    onClose={onClose}
                    TransitionComponent={Slide}
                    ClickAwayListenerProps={{ mouseEvent: false, touchEvent: false }}
                />
                <Backdrop invisible sx={{ zIndex: theme => theme.zIndex.drawer + 1 }} open={visible} />
            </>
        );
    }

    return (
        <Snackbar
            open={visible}
            anchorOrigin={{
                horizontal: 'center',
                vertical: 'top'
            }}
            autoHideDuration={duration}
            TransitionComponent={Slide}
            onClose={onClose}
            ClickAwayListenerProps={{ mouseEvent: false, touchEvent: false }}>
            <Alert severity={type} elevation={6} variant="filled" sx={{ width: '100%' }} onClose={onClose}>
                {message}
            </Alert>
        </Snackbar>
    );
};

function createToast(type: ToastProps['type']) {
    return (message: ToastProps['message'], duration = 3000, onClose?: () => void) => {
        if (message instanceof Error) {
            message = message.message;
        }

        const container = document.createElement('div');
        const root = createRoot(container);

        document.body.appendChild(container);

        const clearContainer = () => {
            root.unmount();
            document.body.removeChild(container);
        };

        const updateToast = (visible: boolean) => {
            root.render(
                <Toast
                    visible={visible}
                    message={message}
                    duration={duration}
                    type={type}
                    onClose={() => {
                        onClose?.();
                        hideToast();
                    }}
                />
            );
        };

        const hideToast = () => {
            updateToast(false);
            setTimeout(() => clearContainer(), 500);
        };

        updateToast(true);

        return hideToast;
    };
}
