import React, { Component } from 'react';
import { Button, ButtonProps as BSButtonProps, Spinner } from 'react-bootstrap';
import classlist from 'utils/classlist';

export interface ButtonProps extends Omit<BSButtonProps, 'type'> {
    loading?: boolean; // 显示加载中状态
    round?: boolean; // 大圆角按钮
    ghost?: boolean; // 是否背景透明模式（幽灵模式）
    type?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light' | 'link'; // 风格定义，同variant
    htmlType?: string; // 传递给按钮dom节点的type属性，type="submit"
}

class TGButton extends Component<ButtonProps & Omit<React.ComponentPropsWithRef<'button'>, 'type'>> {
    public render() {
        const { children, loading, round, ghost, type, htmlType, ...props } = this.props;
        let variant;

        if (type === 'default') {
            variant = 'light';
        } else if (ghost && type && !/^outline-/.test(type)) {
            variant = 'outline-' + type;
        } else {
            variant = type;
        }

        const overrideProps = {
            variant,
            type: htmlType
        };

        return (
            // @ts-ignore
            <Button
                {...props}
                {...overrideProps}
                className={classlist(props.className, {
                    'btn-loading': loading,
                    'btn-round': round,
                    'btn-ghost': ghost
                })}>
                {loading && (
                    <>
                        <Spinner as="span" animation="border" size="sm" />{' '}
                    </>
                )}
                {children}
            </Button>
        );
    }
}

export default TGButton;
