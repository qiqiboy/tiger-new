import React from 'react';
import { Spinner, SpinnerProps } from 'react-bootstrap';
import './style.scss';

export interface LoadingProps extends Omit<SpinnerProps, 'variant' | 'animation'> {
    type?: SpinnerProps['animation'];
    color?: SpinnerProps['variant'];
    tip?: React.ReactNode; // 加载中的文字
    className?: string;
    inline?: boolean;
}

const Loading: React.FC<LoadingProps> = props => {
    const { type, children, tip = children, color, inline, className, ...others } = props;

    return (
        <div
            className={[
                'loading-root',
                inline && 'loading-inline',
                tip && 'loading-with-tip',
                'text-muted',
                'small',
                className
            ]
                .filter(Boolean)
                .join(' ')}>
            <Spinner className="spinner-self" animation={type!} variant={color} {...others} />
            {tip}
        </div>
    );
};

Loading.defaultProps = {
    type: 'border',
    color: 'primary'
};

export default Loading;
