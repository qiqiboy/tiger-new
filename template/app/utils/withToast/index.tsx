import React, { Component, Fragment } from 'react';
import { Fade } from 'components/Transition';
import Portal from 'components/Portal';
import Loading from 'components/Loading';
import './style.scss';

type TError = string | Error;

export interface IToastProps {
    showToast(error: TError, timeout?: number): Promise<any>;
    showToastLoading(loadingText: React.ReactNode): void;
    hideToastLoading(): void;
}

/**
 * @desc 对表单提供统一的逻辑处理
 *  当前支持：短暂错误浮窗展示 showToast
 *
 *  可以参考登录模块
 */
export default function<Self = {}>(WrappedComponent: React.ComponentType<Self & IToastProps>): React.ComponentClass<Self> {
    return class extends Component<Self> {
        toastTimer: NodeJS.Timeout;

        state = {
            showToast: false,
            showToastLoading: false,
            errorMsg: null,
            loadingText: null
        };

        showToast = (error, timeout = 1500) =>
            new Promise(resolve => {
                const errorMsg = typeof error === 'string' ? error : error.message;

                this.setState({
                    showToast: true,
                    errorMsg
                });

                clearTimeout(this.toastTimer);

                // 1s后清除显示
                this.toastTimer = setTimeout(
                    () =>
                        this.setState(
                            {
                                showToast: false
                            },
                            resolve
                        ),
                    timeout
                );
            });

        showToastLoading = (loadingText = null) => {
            this.setState({
                loadingText,
                showToastLoading: true
            });
        };

        hideToastLoading = () =>
            this.setState({
                showToastLoading: false
            });

        render() {
            const { showToast, showToastLoading, errorMsg, loadingText } = this.state;

            return (
                <Fragment>
                    <WrappedComponent
                        {...this.props}
                        showToast={this.showToast}
                        showToastLoading={this.showToastLoading}
                        hideToastLoading={this.hideToastLoading}
                    />
                    <Fade in={showToast}>
                        <Portal>
                            <div className="gloabl-error-toast">{errorMsg}</div>
                        </Portal>
                    </Fade>
                    <Fade in={showToastLoading}>
                        <Portal>
                            <div className="gloabl-loading-toast">
                                <Loading>{loadingText}</Loading>
                            </div>
                        </Portal>
                    </Fade>
                </Fragment>
            );
        }
    };
}
