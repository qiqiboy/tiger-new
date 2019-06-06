import React, { useState } from 'react';
import classlist from 'utils/classlist';
import './style.scss';

export interface ICheckboxProps {
    children?: React.ReactNode;
    className?: string;
    inline?: boolean;
    disabled?: boolean;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?(checked: boolean): void;
}

const Checkbox: React.FC<ICheckboxProps> = props => {
    const [checked, setChecked] = useState(() => !!props.defaultChecked);
    const isChecked = typeof props.checked === 'boolean' ? props.checked : checked;
    const onClick = ev => {
        // 点击链接不触发
        if (!props.disabled && ev.target.nodeName !== 'A') {
            if (typeof props.checked !== 'boolean') {
                setChecked(!isChecked);
            }

            if (props.onChange) {
                props.onChange(!isChecked);
            }
        }
    };

    return (
        <div
            className={classlist('form-checkbox', props.className, {
                'checkbox-disabled': props.disabled,
                'checkbox-checked': isChecked
            })}
            onClick={onClick}>
            <div className="checked-icon" />
            {props.children}
        </div>
    );
};

// @ts-ignore 适配react-bootstrap-formuitl
Checkbox.formutilType = 'checked';

export default Checkbox;
