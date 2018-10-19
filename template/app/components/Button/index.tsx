import React, { Component } from 'react';
import classlist from 'utils/classlist';
import { Fade } from '../Transition';
import './style.scss';

interface IButtonProps extends React.ButtonHTMLAttributes<any> {
    className?: string;
    disabled?: boolean;
    block?: boolean;
    active?: boolean;
    size?: 'lg' | 'md' | 'sm' | 'xs';
    link?: boolean;
    href?: string;
    type?: 'primary' | 'danger' | 'success' | 'info' | 'default' | 'warning';
    isLoading?: boolean;
    loading?: boolean;
}

class Button extends Component<IButtonProps> {
    static defaultProps = {
        isLoading: false,
        loading: false,
        disabled: false,
        block: false,
        active: false,
        link: false,
        size: 'md'
    };

    render() {
        const {
            className,
            disabled,
            size,
            type,
            link,
            block,
            active,
            isLoading,
            loading,
            children,
            ...restProps
        } = this.props;

        const Base: string = typeof this.props.href === 'string' ? 'a' : 'button';

        return (
            <Base
                {...restProps}
                className={classlist(className, 'btn', 'btn-' + size, {
                    ['btn-' + type]: !!type,
                    'btn-disabled': disabled,
                    'btn-loading': isLoading || loading,
                    'btn-block': block,
                    'btn-active': active,
                    'btn-link': link
                })}
                disabled={disabled}>
                <Fade in={!!(isLoading || loading)}>
                    <span className="spin" />
                </Fade>
                {children}
            </Base>
        );
    }
}

export default Button;
