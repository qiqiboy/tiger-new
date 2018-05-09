import React, { Component, Fragment } from 'react';
import { Fade } from 'components/Transition';
import Portal from 'components/Portal';
import './style.scss';

/**
 * @desc 对表单提供统一的逻辑处理
 *  当前支持：短暂错误浮窗展示 showToast
 *
 *  可以参考登录模块
 */
export default function(WrappedComponent) {
    return class extends Component {
        state = {
            showToast: false,
            errorMsg: null
        };

        showToast = error =>
            new Promise(resolve => {
                const errorMsg = typeof error === 'string' ? error : error.message;

                this.setState({
                    showToast: true,
                    errorMsg
                });

                clearTimeout(this.toastTimer);

                //1s后清除显示
                this.toastTimer = setTimeout(
                    () =>
                        this.setState(
                            {
                                showToast: false
                            },
                            resolve
                        ),
                    1500
                );
            });

        render() {
            const { showToast, errorMsg } = this.state;
            return (
                <Fragment>
                    <WrappedComponent {...this.props} showToast={this.showToast} />
                    <Fade in={showToast}>
                        <Portal>
                            <div className="gloabl-error-toast">{errorMsg}</div>
                        </Portal>
                    </Fade>
                </Fragment>
            );
        }
    };
}
