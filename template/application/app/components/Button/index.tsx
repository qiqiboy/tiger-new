import React, { Component } from 'react';
import { Button, ButtonProps as BSButtonProps, Spinner } from 'react-bootstrap';
import WaterWave, { WaterWaveProps } from 'water-wave';
import 'water-wave/style.css';
import classlist from 'utils/classlist';
import './style.scss';

export interface ButtonProps extends Omit<BSButtonProps, 'type' | 'variant' | 'size'> {
    loading?: boolean; // 显示加载中状态
    round?: boolean; // 大圆角按钮
    ghost?: boolean; // 是否背景透明模式（幽灵模式）
    type?:
        | 'default'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'danger'
        | 'warning'
        | 'info'
        | 'dark'
        | 'light'
        | 'blue'
        | 'link'; // 风格定义，同variant
    size?: 'lg' | 'sm' | 'xs';
    htmlType?: string; // 传递给按钮dom节点的type属性，type="submit"
    pressEffect?: WaterWaveProps['effect'];
}

class TGButton extends Component<ButtonProps & Omit<React.ComponentPropsWithRef<'button'>, 'type'>> {
    static defaultProps = {
        type: 'primary'
    };

    public render() {
        const { children, loading, round, ghost, type, htmlType, pressEffect, ...props } = this.props;
        let variant;

        if (type === 'default') {
            variant = 'light';
        } else {
            variant = type;
        }

        if (ghost && variant && !/^outline-/.test(variant)) {
            variant = `outline-${variant}`;
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
                        <Spinner
                            as="span"
                            className={props.size === 'lg' ? 'align-middle' : undefined}
                            animation="border"
                            size="sm"
                        />{' '}
                    </>
                )}
                {children}
                <WaterWave press="down" disabled={props.disabled} effect={pressEffect} />
            </Button>
        );
    }
}

export default TGButton;
