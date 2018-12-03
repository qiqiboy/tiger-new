import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import classlist from 'utils/classlist';
import './style.scss';

export interface IBigIconProps {
    icon: React.ReactNode;
    type?: 'primary' | 'danger' | 'success' | 'info' | 'warning' | 'default';
    size?: 'xs' | 'sm' | 'md' | 'lg' | number;
    className?: string;
}

class BigIcon extends Component<IBigIconProps> {
    static defaultProps = {
        type: 'primary',
        size: 'md'
    };

    public render() {
        const { icon, type, size, className } = this.props;
        const iconNode = typeof icon === 'string' ? <Glyphicon glyph={icon} /> : icon;
        const style =
            typeof size === 'number'
                ? {
                      fontSize: size,
                      width: size * 2,
                      height: size * 2
                  }
                : undefined;

        return (
            <div
                className={classlist('big-icon-root', `big-icon-type-${type}`, `big-icon-size-${size}`, className)}
                style={style}>
                {iconNode}
            </div>
        );
    }
}

export default BigIcon;
