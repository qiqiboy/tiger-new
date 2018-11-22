import React, { Component, Fragment } from 'react';
import { render as reactRender, unmountComponentAtNode } from 'react-dom';
import { Glyphicon } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import { Fade } from 'components/Transition';
import classlist from 'utils/classlist';
import './style.scss';

export interface IToastProps {
    visible: boolean;
    children: React.ReactNode;
    className?: string;

    [key: string]: any;
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
class Toast extends Component<IToastProps, { loaded: boolean }> {
    readonly state = { loaded: false };

    container: Element;

    public componentDidMount() {
        if (!this.container) {
            this.container = document.createElement('div');
            document.body.appendChild(this.container);
            document.body.classList.add('modal-open');
        }

        this.setState({
            loaded: true
        });
    }

    public componentWillUnmount() {
        if (this.container) {
            document.body.removeChild(this.container);
            document.body.classList.remove('modal-open');
        }
    }

    public render() {
        const { children, visible, className, ...props } = this.props;

        return this.state.loaded
            ? createPortal(
                  <Fragment>
                      <Fade in={visible} {...props}>
                          <div className={classlist('toast-root', className)}>{children}</div>
                      </Fade>
                      <Fade in={visible}>
                          <div className="toast-backdrop" />
                      </Fade>
                  </Fragment>,
                  this.container
              )
            : null;
    }

    static show = (content: React.ReactNode, timeout: number = 1500) => {
        if (content instanceof Error) {
            content = content.message;
        }

        const toast = open(content);

        setTimeout(toast.close, timeout);

        return toast.result;
    };

    static loadingInstance: any = null;

    static loading = (visible: boolean) => {
        let result;

        if (visible && !Toast.loadingInstance) {
            Toast.loadingInstance = open(<Glyphicon glyph="refresh" />, { className: 'toast-loading-root' });
            result = Toast.loadingInstance.result;
        }

        if (!visible && Toast.loadingInstance) {
            result = Toast.loadingInstance.result;
            Toast.loadingInstance.close();
            Toast.loadingInstance = null;
        }

        return result;
    };
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
        reactRender(
            <Toast
                {...others}
                visible={visible}
                onExited={() => {
                    if (!callback) {
                        callback = withResolve;
                    }

                    callback!();
                    destroy();
                }}>
                {content}
            </Toast>,
            div
        );
    }

    render(false);

    setTimeout(() => render(true));

    return {
        close,
        result: new Promise(resolve => {
            withResolve = resolve;
        })
    };
}

export default Toast;
