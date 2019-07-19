import React, { Component } from 'react';
import { Button, ButtonProps, Sizes } from 'react-bootstrap';
import Loading from 'components/Loading';
import classlist from 'utils/classlist';
import './style.scss';

export interface IHButtonProps extends Omit<ButtonProps, 'type' | 'size'> {
    loading?: boolean; // 显示加载中状态
    round?: boolean; // 大圆角按钮
    ghost?: boolean; // 是否背景透明模式（幽灵模式）
    type?: 'default' | 'primary' | 'info' | 'danger' | 'warning' | 'success' | 'link'; // 风格定义，同bsStyle。也可以继续使用bsStyle字段
    size?: Sizes; // 尺寸定义，同bsSize。也可以继续使用bsSize字段
    htmlType?: string; // 传递给按钮dom节点的type属性，type="submit"
}

class HButton extends Component<IHButtonProps> {
    public render() {
        const { children, loading, round, ghost, size, type, htmlType, ...props } = this.props;
        const overrideProps = {
            bsSize: size as any,
            bsStyle: type,
            type: htmlType
        };

        return (
            <Button
                {...overrideProps}
                {...props}
                className={classlist(props.className, {
                    'btn-loading': loading,
                    'btn-round': round,
                    'btn-ghost': ghost
                })}>
                {loading && <Loading type="circle" />}
                {children}
            </Button>
        );
    }
}

export default HButton;
