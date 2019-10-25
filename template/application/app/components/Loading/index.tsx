import React from 'react';
import { Spinner, SpinnerProps } from 'react-bootstrap';
import './style.scss';

export interface LoadingProps extends Omit<SpinnerProps, 'variant' | 'animation'> {
    type?: SpinnerProps['animation'];
    color?: SpinnerProps['variant'];
    tip?: React.ReactNode; // 加载中的文字
    className?: string;
}

const Loading: React.FC<LoadingProps> = props => {
    const { type, children, tip = children, color, className, ...others } = props;
    const spinner = <Spinner animation={type!} variant={color} {...others} />;

    if (tip) {
        return (
            <div className={['loading-root', 'loading-with-tip', 'text-muted', 'small', className].filter(Boolean).join(' ')}>
                {spinner}
                {tip}
            </div>
        );
    }

    return spinner;
};

Loading.defaultProps = {
    type: 'border',
    color: 'primary'
};

export default Loading;
