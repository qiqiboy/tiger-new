import React, { Component } from 'react';
import classlist from 'utils/classlist';
import './style.less';

export interface ISwitchProps {
    value?: any;
    checked?: any;
    unchecked?: any;
    children?: React.ReactNode;
    inline?: boolean;
    disabled?: boolean;
    type?: 'success' | 'info' | 'primary' | 'danger' | 'warning';
    className?: string;
    onChange?(value: any): void;
}

class Switch extends Component<ISwitchProps> {
    static defaultProps = {
        checked: true,
        unchecked: false,
        inline: false,
        type: 'primary',
        disabled: false
    };

    onChange = () => {
        this.props.onChange!(this.props.value === this.props.checked ? this.props.unchecked : this.props.checked);
    };

    public render() {
        const { children, value, checked, unchecked, className, inline, type, ...props } = this.props;
        const isChecked = value === checked;
        const SwitchNode = <button {...props} onClick={this.onChange} className="switch-style-button" />;
        const childNode = typeof children === 'string' ? <span className="switch-label">{children}</span> : children;

        return (
            <div
                className={classlist(
                    'switch-container',
                    'switch-style-' + type,
                    {
                        'switch-inline': inline,
                        'switch-active': isChecked,
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
