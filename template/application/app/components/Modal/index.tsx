import React, { Children, cloneElement, Component } from 'react';
import { render as reactRender, unmountComponentAtNode, createPortal, Renderer } from 'react-dom';
import { Modal, ModalProps as BSModalProps } from 'react-bootstrap';
import { isValidElementType } from 'react-is';
import './style.scss';

const _Modal = Modal;

export default _Modal as INewModal;

type INewModal = typeof Modal & {
    open: (
        config: ModalProps
    ) => ModalHandler & {
        result: Promise<any>;
        render(component: RenderCompoenent): void;
    };
};

type RenderCompoenent = React.ComponentType<any> | React.ReactElement<any>;

type ModalProps = Partial<
    Pick<
        BSModalProps,
        | 'size'
        | 'bsPrefix'
        | 'centered'
        | 'backdropClassName'
        | 'dialogClassName'
        | 'dialogAs'
        | 'scrollable'
        | 'style'
        | 'className'
        | 'show'
        | 'container'
        | 'onShow'
        | 'onHide'
        | 'manager'
        | 'backdrop'
        | 'onEscapeKeyDown'
        | 'onBackdropClick'
        | 'onExiting'
        | 'restoreFocusOptions'
        | 'restoreFocus'
        | 'enforceFocus'
        | 'autoFocus'
        | 'keyboard'
        | 'containerClassName'
    >
> & {
    component: RenderCompoenent;
    animation?: boolean | 'slide' | 'fade';
};

export interface ModalHandler {
    close(data?: any): void;
    dismiss(reason?: any): void;
}

const defaultSettings = {
    animation: true
};

let renderToRoot = reactRender;

/**
 * @desc 给react-bootstrap的Modal扩展一个open方法，用来方便的创建更灵活的modal。
 *       默认的Modal组件依赖于组件声明式受控调用，非常麻烦，尤其是需要从组件内部关闭modal时，需要将关闭句柄向下传递；
 *       并且对于多modal场景下，使用也非常麻烦，需要定义多个状态值对应到不同的modal的visible状态！
 *
 *       新增的Modal.open方法，通过封装隐藏了visible控制，通过对外暴漏以及向下传递close、dismiss句柄以及promise，可以方便的用来从外部、组件内部关闭modal，
 *       并且可以方便的通过promise来处理modal关闭的回调！
 *
 * @usage Modal.open({ component: YourComponent / <YourComponent />, ...ModalProps  })
 *
 *        component参数支持传入组件定义，或者直接传入该组件调用的reactNode。
 *        无论哪种方式，Modal.open都会向其传递close、dismiss属性。
 *        在YourComponent组件内部，你可以方便的通过这两种方法来关闭modal。
 *
 *        close、dismiss两个方法都可以用来关闭modal，不同的是他们对于返回的promise的状态有影响：
 *        close => Promise.resolved
 *        dismiss => Promise.rejected
 *
 * @param {Object} config 配置参数，支持Modal的所有的props参数，另外新增扩展了component参数，具体使用参考上方说明!
 *
 * @return {Object} { close, dismiss, result: Promise }
 *          返回一个对象，包含了close、dismiss两个关闭方法，以及一个result的promise对象，可以通过该promise来访问modal关闭时的回调！
 */
export const open = ((_Modal as INewModal).open = config => {
    let destroyed;
    let withResolve;
    let withReject;

    const settings = { ...defaultSettings, ...config };

    const div = document.createElement('div');

    document.body.appendChild(div);

    function destroy() {
        if (!destroyed) {
            destroyed = true;

            unmountComponentAtNode(div);

            document.body.removeChild(div);
        }
    }

    function close(data?) {
        render(false, () => withResolve(data));
    }

    function dismiss(reason?) {
        render(false, () => withReject(reason));
    }

    function onHide() {
        dismiss();

        if (settings.onHide) {
            settings.onHide();
        }
    }

    function render(visible, callback?: () => void) {
        const { component: TheComponent, animation, ...props } = settings;
        const childProps = {
            close,
            dismiss
        };

        let children;

        if (isValidElementType(TheComponent)) {
            children = <TheComponent />;
        } else {
            children = TheComponent;
        }

        renderToRoot(
            <Modal
                // @ts-ignore
                onHide={onHide}
                {...props}
                animation={Boolean(animation)}
                className={[
                    props.className,
                    animation && `animation-${typeof animation === 'string' ? animation : 'fade'}`
                ]
                    .filter(Boolean)
                    .join(' ')}
                show={visible}
                onExited={() => {
                    if (!callback) {
                        callback = withReject;
                    }

                    callback!();
                    destroy();
                }}>
                {Children.map(children, child => cloneElement(child as React.ReactElement<any>, childProps))}
            </Modal>,
            div
        );

        // 如果关闭动画，则直接执行回调
        if (visible === false && animation === false && callback) {
            callback();
            destroy();
        }
    }

    render(true);

    return {
        close,
        dismiss,
        result: new Promise((resolve, reject) => {
            withResolve = resolve;
            withReject = reject;
        }),
        render(newContent: RenderCompoenent) {
            settings.component = newContent;

            render(true);
        }
    };
});

export interface ModalRootState {
    modals: Record<string, React.ReactElement>;
}

export class ModalRoot extends Component<{}, ModalRootState> {
    readonly state: ModalRootState = {
        modals: {}
    };

    root: HTMLDivElement;

    public componentDidMount() {
        renderToRoot = ((element, target) => {
            if (!target.id) {
                target.id = `bs-modal-${Date.now() + Math.random()}`;
            }

            const { modals } = this.state;
            const originalCallback = element.props.onExited;

            modals[target.id] = cloneElement(element, {
                key: target.id,
                onExited: () => {
                    originalCallback?.();

                    const { modals } = this.state;

                    delete modals[target.id];

                    this.setState({
                        modals
                    });
                }
            });

            this.setState({
                modals
            });
        }) as Renderer;
    }

    public componentWillUnmount() {
        this.root && document.body.removeChild(this.root);
    }

    render() {
        if (!this.root) {
            this.root = document.createElement('div');

            document.body.appendChild(this.root);
        }

        return createPortal(Object.values(this.state.modals), this.root);
    }
}
