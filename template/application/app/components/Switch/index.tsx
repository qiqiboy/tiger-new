import React, { Component } from 'react';
import classlist from 'utils/classlist';
import './style.scss';

export interface ISwitchProps {
    checked?: boolean;
    children?: React.ReactNode;
    inline?: boolean;
    disabled?: boolean;
    type?: 'success' | 'info' | 'primary' | 'danger' | 'warning';
    className?: string;
    onChange?(value: any): void;
}

class Switch extends Component<ISwitchProps> {
    static formutilType = 'checked';
    static defaultProps = {
        checked: false,
        inline: false,
        type: 'primary',
        disabled: false
    };

    onChange = () => {
        this.props.onChange!(!this.props.checked);
    };

    public render() {
        const { children, checked, className, inline, type, ...props } = this.props;
        const SwitchNode = <button type="button" {...props} onClick={this.onChange} className="switch-style-button" />;
        const childNode = typeof children === 'string' ? <span className="switch-label">{children}</span> : children;

        return (
            <div
                className={classlist(
                    'switch-container',
                    'switch-style-' + type,
                    {
                        'switch-inline': inline,
                        'switch-active': checked,
                        'switch-children': !!children,
                        'switch-disabled': props.disabled
                    },
                    className
                )}>
                {SwitchNode}
                {childNode}
            </div>
        );
    }
}

export default Switch;
