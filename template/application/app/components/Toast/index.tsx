import React, { Component } from 'react';
import { render as reactRender, unmountComponentAtNode } from 'react-dom';
import Loading from 'components/Loading';
import { Fade } from 'components/Transition';
import { TransitionProps } from 'components/Transition/withTransition';
import Portal from 'components/Portal';
import classlist from 'utils/classlist';
import './style.scss';

export interface ToastProps extends TransitionProps {
    visible: boolean;
    children: React.ReactNode;
    className?: string;
    backdrop?: 'static' | false | 'transparent';
}

/**
 * @description
 * Toast组件，用来展示无需用户响应的弹出框
 *
 * Toast.show(content, timeout?) 显示content内容，timeout用来控制显示时长，该时间后消失
 *
 * Toast.loading(isShow) 控制全局的loading
 *
 */
class Toast extends Component<ToastProps, { loaded: boolean }> {
    static defaultProps = {
        backdrop: 'transparent'
    };

    state = {
        loaded: false
    };

    public componentDidMount() {
        Toast.allInstances.push(this);

        this.setState({
            loaded: true
        });
    }

    public componentWillUnmount() {
        Toast.allInstances = Toast.allInstances.filter(item => item !== this);
    }

    public render() {
        const { children, visible, className, backdrop, ...props } = this.props;
        const isShow = visible && this.state.loaded;

        return (
            <Fade in={isShow} {...props}>
                <Portal>
                    <div className="toast-root">
                        {backdrop && <div className={classlist('toast-backdrop', `toast-backdrop-${backdrop}`)} />}
                        <div className={classlist('toast-body', className)}>{children}</div>
                    </div>
                </Portal>
            </Fade>
        );
    }

    /**
     * 显示toast提示
     */
    static show = (content: React.ReactNode, timeout: number = 1500) => {
        if (content instanceof Error) {
            content = content.message;
        }

        const toast = open(content);

        setTimeout(toast.close, timeout);

        return toast.result;
    };

    static loadingInstance: any = null;

    /**
     * 显示toast loading
     */
    static loading = (visible: boolean, text: string = ''): Promise<never> => {
        let result;

        if (visible) {
            const LoadingElement = <Loading tip={text} />;

            if (!Toast.loadingInstance) {
                Toast.loadingInstance = open(LoadingElement, {
                    className: 'toast-loading-root',
                    backdrop: 'static'
                });
            } else {
                Toast.loadingInstance.render(LoadingElement);
            }

            result = Toast.loadingInstance.result;
        }

        if (!visible && Toast.loadingInstance) {
            result = Toast.loadingInstance.result;
            Toast.loadingInstance.close();
            Toast.loadingInstance = null;
        }

        return result;
    };

    static allInstances: Toast[] = [];
}

function open(content: React.ReactNode, others?: object) {
    let destroyed;
    let withResolve;

    const div = document.createElement('div');

    document.body.appendChild(div);

    function destroy() {
        if (!destroyed) {
            destroyed = true;

            unmountComponentAtNode(div);

            document.body.removeChild(div);
        }
    }

    function close() {
        render(false, () => withResolve());
    }

    function render(visible, callback?: () => void) {
        const onExited = () => {
            if (!callback) {
                callback = withResolve;
            }

            callback!();
            destroy();
        };

        reactRender(
            <Toast {...others} visible={visible} onExited={onExited}>
                {content}
            </Toast>,
            div
        );

        if (!visible) {
            setTimeout(() => {
                if (!destroyed) {
                    onExited();
                }
            }, 1000);
        }
    }

    render(true);

    return {
        close,
        result: new Promise<never>(resolve => {
            withResolve = resolve;
        }),
        render(newContent) {
            content = newContent;

            render(true);
        }
    };
}

export default Toast;
